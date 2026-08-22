const { Attendance, User } = require('../../models');
const { Op } = require('sequelize');

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (DATEONLY)
}

// Inclusive 7-day window ending today, as [start, end] DATEONLY strings.
function last7DaysRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

async function checkIn(req, res) {
  const userId = req.user.id;
  const date = todayStr();
  try {
    let record = await Attendance.findOne({ where: { userId, date } });

    if (record && record.checkInTime) {
      return res.status(409).json({ success: false, error: 'Already checked in today' });
    }

    if (record) {
      record.checkInTime = new Date();
      record.status = 'present';
      await record.save();
    } else {
      record = await Attendance.create({
        userId,
        date,
        checkInTime: new Date(),
        status: 'present',
      });
    }

    return res.json({ success: true, data: { record } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to check in' });
  }
}

async function checkOut(req, res) {
  const userId = req.user.id;
  const date = todayStr();
  try {
    const record = await Attendance.findOne({ where: { userId, date } });

    if (!record || !record.checkInTime) {
      return res.status(409).json({ success: false, error: 'You must check in before checking out' });
    }

    if (record.checkOutTime) {
      return res.status(409).json({ success: false, error: 'Already checked out today' });
    }

    record.checkOutTime = new Date();
    await record.save();

    return res.json({ success: true, data: { record } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to check out' });
  }
}

async function getMe(req, res) {
  const userId = req.user.id;
  const range = req.query.range === 'weekly' ? 'weekly' : 'daily';
  try {
    let records;
    if (range === 'daily') {
      const record = await Attendance.findOne({ where: { userId, date: todayStr() } });
      records = record ? [record] : [];
    } else {
      const { start, end } = last7DaysRange();
      records = await Attendance.findAll({
        where: { userId, date: { [Op.between]: [start, end] } },
        order: [['date', 'ASC']],
      });
    }
    return res.json({ success: true, data: { range, records } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch attendance' });
  }
}

// Admin only. Same range logic across all users; includes the user's
// name/employeeId (joined against User) so the admin UI needs one request.
async function getAll(req, res) {
  const range = req.query.range === 'weekly' ? 'weekly' : 'daily';
  try {
    const where = range === 'daily'
      ? { date: todayStr() }
      : { date: { [Op.between]: [last7DaysRange().start, last7DaysRange().end] } };

    const records = await Attendance.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'employeeId'] }],
      order: [['date', 'DESC'], ['userId', 'ASC']],
    });

    return res.json({ success: true, data: { range, records } });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch attendance' });
  }
}

module.exports = { checkIn, checkOut, getMe, getAll };
