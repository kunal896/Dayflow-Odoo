const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../../models');

function publicUser(user) {
  const data = user.toJSON();
  delete data.passwordHash;
  return data;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

async function signup(req, res) {
  try {
    const { employeeId, name, email, password, role } = req.body;
    if (!employeeId || !name || !email || !password || !role) return res.status(400).json({ success: false, error: 'employeeId, name, email, password and role are required' });
    if (!['employee', 'admin'].includes(role)) return res.status(400).json({ success: false, error: 'role must be employee or admin' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'Invalid email format' });
    if (!validatePassword(password)) return res.status(400).json({ success: false, error: 'Password must be at least 8 characters and include a letter and a number' });
    const duplicate = await User.findOne({ where: { email } });
    if (duplicate) return res.status(409).json({ success: false, error: 'Email already registered' });
    const duplicateEmployee = await User.findOne({ where: { employeeId } });
    if (duplicateEmployee) return res.status(409).json({ success: false, error: 'Employee ID already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(24).toString('hex'); // mocked for demo
    const user = await User.create({ employeeId, name, email, passwordHash, role, isEmailVerified: false });
    console.log(`[MOCK EMAIL VERIFICATION] ${email} -> ${verificationToken}`);
    return res.status(201).json({ success: true, data: { user: publicUser(user), verificationToken } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to create account' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password are required' });
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ success: false, error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, employeeId: user.employeeId, role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, data: { token, user: publicUser(user) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to login' });
  }
}

module.exports = { signup, login };
