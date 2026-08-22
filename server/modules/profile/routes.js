const router = require('express').Router();
const { verifyToken, requireRole } = require('../../middleware/auth');
const { getMe, updateMe, listAll, getById, updateById } = require('./controller');

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);

// Admin-only employee listing. Not present in CONTRACT.md as originally written — added here
// because employee listing belongs to the profile module. Flagged for CONTRACT.md sync.
router.get('/all', verifyToken, requireRole('admin'), listAll);

// NOTE: these two must stay below the more specific routes above ('/me', '/all'),
// otherwise Express would match e.g. GET /api/profile/all as :userId = "all".
router.get('/:userId', verifyToken, requireRole('admin'), getById);
router.put('/:userId', verifyToken, requireRole('admin'), updateById);

module.exports = router;
