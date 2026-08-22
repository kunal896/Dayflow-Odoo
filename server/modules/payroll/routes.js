const router = require('express').Router();
const { verifyToken, requireRole } = require('../../middleware/auth');
const { Payroll, User } = require('../../models');

// GET /api/payroll/me — authenticated user, read-only
router.get('/me', verifyToken, async (req, res) => {
  try {
    const records = await Payroll.findAll({
      where: { userId: req.user.id },
      order: [['year', 'DESC'], ['month', 'DESC']],
    });
    return res.json({ success: true, data: records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to fetch payroll records' });
  }
});

// GET /api/payroll/all — admin only, includes name/employeeId
router.get('/all', verifyToken, requireRole('admin'), async (_req, res) => {
  try {
    const records = await Payroll.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'employeeId'] }],
      order: [['year', 'DESC'], ['month', 'DESC']],
    });
    return res.json({ success: true, data: records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to fetch payroll records' });
  }
});

// PUT /api/payroll/:userId — admin only, creates or updates the userId/month/year record
router.put('/:userId', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { baseSalary, allowances, deductions, month, year } = req.body;

    if (baseSalary === undefined || baseSalary === null || month === undefined || year === undefined) {
      return res.status(400).json({ success: false, error: 'baseSalary, month and year are required' });
    }

    const base = Number(baseSalary);
    const allow = Number(allowances ?? 0);
    const deduct = Number(deductions ?? 0);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if ([base, allow, deduct].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ success: false, error: 'baseSalary, allowances and deductions must be numbers' });
    }
    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ success: false, error: 'month must be an integer between 1 and 12' });
    }
    if (!Number.isInteger(yearNum) || yearNum < 2000) {
      return res.status(400).json({ success: false, error: 'year must be a valid integer year' });
    }

    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const netSalary = base + allow - deduct;

    const [record] = await Payroll.findOrCreate({
      where: { userId: req.params.userId, month: monthNum, year: yearNum },
      defaults: { baseSalary: base, allowances: allow, deductions: deduct, netSalary },
    });

    record.baseSalary = base;
    record.allowances = allow;
    record.deductions = deduct;
    record.netSalary = netSalary;
    await record.save();

    return res.json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to update payroll record' });
  }
});

module.exports = router;
