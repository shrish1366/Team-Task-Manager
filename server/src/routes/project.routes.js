const router = require('express').Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject, addProjectMember, removeProjectMember } = require('../controllers/project.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', requireAdmin, createProject);
router.patch('/:id', requireAdmin, updateProject);
router.delete('/:id', requireAdmin, deleteProject);
router.post('/:id/members', requireAdmin, addProjectMember);
router.delete('/:id/members/:userId', requireAdmin, removeProjectMember);

module.exports = router;
