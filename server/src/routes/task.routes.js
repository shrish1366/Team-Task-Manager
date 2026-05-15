const router = require('express').Router();
const { createTask, getTasks, getTaskById, updateTask, updateTaskStatus, deleteTask, addComment, deleteComment } = require('../controllers/task.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', requireAdmin, createTask);
router.patch('/:id', requireAdmin, updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', requireAdmin, deleteTask);
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
