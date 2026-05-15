const router = require('express').Router();
const { createTeam, getTeams, getTeamById, updateTeam, deleteTeam, addMember, removeMember } = require('../controllers/team.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', requireAdmin, createTeam);
router.patch('/:id', requireAdmin, updateTeam);
router.delete('/:id', requireAdmin, deleteTeam);
router.post('/:id/members', requireAdmin, addMember);
router.delete('/:id/members/:userId', requireAdmin, removeMember);

module.exports = router;
