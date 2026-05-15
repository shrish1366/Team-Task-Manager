const router = require('express').Router();
const { getAllUsers, getUserById, updateUserRole, deleteUser } = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', requireAdmin, updateUserRole);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
