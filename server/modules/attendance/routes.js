const router = require('express').Router();
const { verifyToken, requireRole } = require('../../middleware/auth');
const { checkIn, checkOut, getMe, getAll } = require('./controller');

router.post('/checkin', verifyToken, checkIn);
router.post('/checkout', verifyToken, checkOut);
router.get('/me', verifyToken, getMe);
router.get('/all', verifyToken, requireRole('admin'), getAll);

module.exports = router;
