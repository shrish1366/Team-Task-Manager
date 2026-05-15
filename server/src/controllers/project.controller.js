const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../utils/activityLogger');

const createProject = async (req, res) => {
  try {
    const { title, description, status, startDate, deadline, teamId, memberIds = [] } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        status,
        startDate: startDate ? new Date(startDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        createdById: req.user.id,
        teamId: teamId || null,
        members: {
          create: [
            { userId: req.user.id },
            ...memberIds.filter((id) => id !== req.user.id).map((userId) => ({ userId })),
          ],
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        team: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
    });

    await logActivity({ action: `Created project "${title}"`, entityType: 'PROJECT', entityId: project.id, userId: req.user.id, projectId: project.id });
    return successResponse(res, project, 'Project created', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getProjects = async (req, res) => {
  try {
    const { search, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.user.role === 'ADMIN';

    const where = {
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(status ? { status } : {}),
      ...(!isAdmin ? { members: { some: { userId: req.user.id } } } : {}),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          creator: { select: { id: true, name: true } },
          members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          team: { select: { id: true, name: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { [sortBy]: order },
      }),
      prisma.project.count({ where }),
    ]);

    // Compute progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (p) => {
        const [total, completed] = await Promise.all([
          prisma.task.count({ where: { projectId: p.id } }),
          prisma.task.count({ where: { projectId: p.id, status: 'COMPLETED' } }),
        ]);
        return { ...p, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
      })
    );

    return successResponse(res, { projects: projectsWithProgress, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } } },
        team: { select: { id: true, name: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, avatar: true } },
            createdBy: { select: { id: true, name: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) return errorResponse(res, 'Project not found', 404);

    const isAdmin = req.user.role === 'ADMIN';
    const isMember = project.members.some((m) => m.userId === req.user.id);
    if (!isAdmin && !isMember) return errorResponse(res, 'Access denied', 403);

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse(res, { ...project, progress });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, status, startDate, deadline, teamId } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        teamId: teamId || null,
      },
      include: {
        creator: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
    });
    await logActivity({ action: `Updated project "${project.title}"`, entityType: 'PROJECT', entityId: project.id, userId: req.user.id, projectId: project.id });
    return successResponse(res, project, 'Project updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return errorResponse(res, 'Project not found', 404);
    await prisma.project.delete({ where: { id: req.params.id } });
    return successResponse(res, null, 'Project deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });
    return successResponse(res, member, 'Member added', 201);
  } catch (err) {
    if (err.code === 'P2002') return errorResponse(res, 'User already in project', 409);
    return errorResponse(res, err.message);
  }
};

const removeProjectMember = async (req, res) => {
  try {
    await prisma.projectMember.deleteMany({
      where: { projectId: req.params.id, userId: req.params.userId },
    });
    return successResponse(res, null, 'Member removed');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, addProjectMember, removeProjectMember };
