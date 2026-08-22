const router = require('express').Router();
const { verifyToken, requireRole } = require('../../middleware/auth');
const { LeaveRequest, User } = require('../../models');

const LEAVE_TYPES = ['paid', 'sick', 'unpaid'];
const DECISION_STATUSES = ['approved', 'rejected'];

// POST /api/leave/apply — authenticated employee
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, remarks } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'leaveType, startDate and endDate are required' });
    }
    if (!LEAVE_TYPES.includes(leaveType)) {
      return res.status(400).json({ success: false, error: 'leaveType must be paid, sick or unpaid' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: 'startDate and endDate must be valid dates' });
    }
    if (end < start) {
      return res.status(400).json({ success: false, error: 'endDate must be on or after startDate' });
    }

    const leave = await LeaveRequest.create({
      userId: req.user.id,
      leaveType,
      startDate,
      endDate,
      remarks: remarks || null,
      status: 'pending',
    });

    return res.status(201).json({ success: true, data: leave });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to submit leave request' });
  }
});

// GET /api/leave/me — authenticated user, most recent first
router.get('/me', verifyToken, async (req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: leaves });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to fetch leave requests' });
  }
});

// GET /api/leave/all — admin only, includes requester name/employeeId
router.get('/all', verifyToken, requireRole('admin'), async (_req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'employeeId'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: leaves });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to fetch leave requests' });
  }
});

// PUT /api/leave/:id/decision — admin only
router.put('/:id/decision', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    if (!DECISION_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'status must be approved or rejected' });
    }

    const leave = await LeaveRequest.findByPk(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    leave.status = status;
    leave.adminComment = adminComment || null;
    await leave.save();

    return res.json({ success: true, data: leave });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to update leave request' });
  }
});

module.exports = router;
