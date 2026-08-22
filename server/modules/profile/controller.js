const { User } = require('../../models');

const ADMIN_EDITABLE_FIELDS = [
  'employeeId',
  'name',
  'email',
  'role',
  'phone',
  'address',
  'jobTitle',
  'profilePicUrl',
  'salaryBase',
  'isEmailVerified',
];

const EMPLOYEE_EDITABLE_FIELDS = ['address', 'phone', 'profilePicUrl'];

function publicUser(user) {
  const data = user.toJSON();
  delete data.passwordHash;
  return data;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Loose phone check: digits, spaces, +, -, ( ) only, 6-30 chars. Empty string clears the field.
function isValidPhone(value) {
  if (value === '' || value === null) return true;
  return typeof value === 'string' && value.length <= 30 && /^[\d\s()+-]{6,30}$/.test(value);
}

function isValidAddress(value) {
  if (value === '' || value === null) return true;
  return typeof value === 'string' && value.length <= 255;
}

function isValidProfilePicUrl(value) {
  if (value === '' || value === null) return true;
  return typeof value === 'string' && value.length <= 500;
}

async function getMe(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: { user: publicUser(user) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to load profile' });
  }
}

async function updateMe(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updates = {};
    for (const field of EMPLOYEE_EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    }
    // Any other field in the body is silently ignored per CONTRACT.md, not an error.

    if (Object.prototype.hasOwnProperty.call(updates, 'phone') && !isValidPhone(updates.phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'address') && !isValidAddress(updates.address)) {
      return res.status(400).json({ success: false, error: 'Address must be 255 characters or fewer' });
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'profilePicUrl') && !isValidProfilePicUrl(updates.profilePicUrl)) {
      return res.status(400).json({ success: false, error: 'Profile picture URL must be 500 characters or fewer' });
    }

    await user.update(updates);
    return res.json({ success: true, data: { user: publicUser(user) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to update profile' });
  }
}

// Admin-only: not in CONTRACT.md as written. Added because employee listing is owned by this
// module and the admin dashboard needs it. Flagged in the PR for CONTRACT.md to be updated.
async function listAll(req, res) {
  try {
    const users = await User.findAll({ order: [['name', 'ASC']] });
    return res.json({ success: true, data: { users: users.map(publicUser) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to load employees' });
  }
}

async function getById(req, res) {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    return res.json({ success: true, data: { user: publicUser(user) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to load profile' });
  }
}

async function updateById(req, res) {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updates = {};
    for (const field of ADMIN_EDITABLE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'email') && !isValidEmail(updates.email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'role') && !['employee', 'admin'].includes(updates.role)) {
      return res.status(400).json({ success: false, error: 'Role must be employee or admin' });
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'phone') && !isValidPhone(updates.phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'address') && !isValidAddress(updates.address)) {
      return res.status(400).json({ success: false, error: 'Address must be 255 characters or fewer' });
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'profilePicUrl') && !isValidProfilePicUrl(updates.profilePicUrl)) {
      return res.status(400).json({ success: false, error: 'Profile picture URL must be 500 characters or fewer' });
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'email')) {
      const duplicate = await User.findOne({ where: { email: updates.email } });
      if (duplicate && duplicate.id !== user.id) {
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'employeeId')) {
      const duplicate = await User.findOne({ where: { employeeId: updates.employeeId } });
      if (duplicate && duplicate.id !== user.id) {
        return res.status(409).json({ success: false, error: 'Employee ID already registered' });
      }
    }

    await user.update(updates);
    return res.json({ success: true, data: { user: publicUser(user) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Unable to update profile' });
  }
}

module.exports = { getMe, updateMe, listAll, getById, updateById };
