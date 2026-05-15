const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../utils/activityLogger');

const createTeam = async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;
    const team = await prisma.team.create({
      data: {
        name,
        description,
        members: {
          create: memberIds.map((userId) => ({ userId })),
        },
      },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } },
    });
    await logActivity({ action: `Created team "${name}"`, entityType: 'TEAM', entityId: team.id, userId: req.user.id });
    return successResponse(res, team, 'Team created', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getTeams = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.user.role === 'ADMIN';

    const where = {
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(!isAdmin ? { members: { some: { userId: req.user.id } } } : {}),
    };

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
          _count: { select: { projects: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.team.count({ where }),
    ]);

    return successResponse(res, { teams, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } } },
        projects: { select: { id: true, title: true, status: true, deadline: true } },
      },
    });
    if (!team) return errorResponse(res, 'Team not found', 404);
    return successResponse(res, team);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: { name, description },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } },
    });
    return successResponse(res, team, 'Team updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const deleteTeam = async (req, res) => {
  try {
    await prisma.team.delete({ where: { id: req.params.id } });
    return successResponse(res, null, 'Team deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const member = await prisma.teamMember.create({
      data: { teamId: req.params.id, userId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    return successResponse(res, member, 'Member added', 201);
  } catch (err) {
    if (err.code === 'P2002') return errorResponse(res, 'User already in team', 409);
    return errorResponse(res, err.message);
  }
};

const removeMember = async (req, res) => {
  try {
    await prisma.teamMember.deleteMany({
      where: { teamId: req.params.id, userId: req.params.userId },
    });
    return successResponse(res, null, 'Member removed');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

module.exports = { createTeam, getTeams, getTeamById, updateTeam, deleteTeam, addMember, removeMember };
