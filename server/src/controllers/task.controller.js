const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../utils/activityLogger');

const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
  createdBy: { select: { id: true, name: true } },
  project: { select: { id: true, title: true } },
  comments: {
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'asc' },
  },
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, deadline, assignedToId, projectId } = req.body;

    // Verify project access
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return errorResponse(res, 'Project not found', 404);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        assignedToId: assignedToId || null,
        projectId,
        createdById: req.user.id,
      },
      include: taskInclude,
    });

    await logActivity({ action: `Created task "${title}"`, entityType: 'TASK', entityId: task.id, userId: req.user.id, projectId, taskId: task.id });
    return successResponse(res, task, 'Task created', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assignedToId, search, overdue, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.user.role === 'ADMIN';
    const now = new Date();

    const where = {
      ...(projectId ? { projectId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assignedToId ? { assignedToId } : {}),
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(overdue === 'true' ? { deadline: { lt: now }, status: { not: 'COMPLETED' } } : {}),
      ...(!isAdmin && !projectId ? { assignedToId: req.user.id } : {}),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: taskInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return successResponse(res, { tasks, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: taskInclude });
    if (!task) return errorResponse(res, 'Task not found', 404);
    return successResponse(res, task);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, deadline, assignedToId } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        deadline: deadline ? new Date(deadline) : undefined,
        assignedToId: assignedToId !== undefined ? assignedToId || null : undefined,
      },
      include: taskInclude,
    });
    await logActivity({ action: `Updated task "${task.title}"`, entityType: 'TASK', entityId: task.id, userId: req.user.id, projectId: task.projectId, taskId: task.id });
    return successResponse(res, task, 'Task updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    if (!validStatuses.includes(status)) return errorResponse(res, 'Invalid status', 400);

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      include: taskInclude,
    });
    await logActivity({ action: `Changed task "${task.title}" status to ${status}`, entityType: 'TASK', entityId: task.id, userId: req.user.id, projectId: task.projectId, taskId: task.id });
    return successResponse(res, task, 'Status updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return errorResponse(res, 'Task not found', 404);
    await prisma.task.delete({ where: { id: req.params.id } });
    return successResponse(res, null, 'Task deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// Comments
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await prisma.comment.create({
      data: { content, taskId: req.params.id, userId: req.user.id },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    return successResponse(res, comment, 'Comment added', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.commentId } });
    if (!comment) return errorResponse(res, 'Comment not found', 404);
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') return errorResponse(res, 'Not authorized', 403);
    await prisma.comment.delete({ where: { id: req.params.commentId } });
    return successResponse(res, null, 'Comment deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, updateTaskStatus, deleteTask, addComment, deleteComment };
