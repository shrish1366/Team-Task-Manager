const router = require('express').Router();
const { getAdminDashboard, getMemberDashboard } = require('../controllers/dashboard.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/admin', requireAdmin, getAdminDashboard);
router.get('/member', getMemberDashboard);

module.exports = router;
