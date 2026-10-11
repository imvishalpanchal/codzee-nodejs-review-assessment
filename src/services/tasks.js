const prisma = require('../config/database/prismaClient');
const { errors } = require('../config/api/errorHandler');
const messages = require('../utils/messages');

const VALID_STATUS_TRANSITIONS = {
  todo: ['in_progress', 'todo'],
  in_progress: ['in_review', 'todo', 'in_progress'],
  in_review: ['done', 'in_progress', 'in_review'],
  done: ['todo', 'done']
};

const taskService = {
  getTasks: async (query = {}, userId, userRole) => {
    const rawPage = parseInt(query.page, 10);
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    const rawLimit = parseInt(query.limit, 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);

    const skip = (page - 1) * limit;

    const where = {};

    if (query.projectId) {
      const projId = parseInt(query.projectId, 10);
      if (!isNaN(projId)) {
        where.projectId = projId;
      }
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.assigneeId) {
      where.assigneeId = query.assigneeId;
    }
    if (query.search) {
      where.title = { contains: query.search };
    }

    if (userRole !== 'admin') {
      where.OR = [
        { assigneeId: userId },
        { project: { ownerId: userId } }
      ];
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: { id: true, name: true, ownerId: true }
          },
          assignee: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);

    return { tasks, total, page, limit };
  },

  getTaskById: async (id, userId, userRole) => {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      throw errors.badRequest('Invalid task ID provided');
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true, ownerId: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    if (!task) {
      throw errors.notFound(messages.TASK.NOT_FOUND);
    }

    if (
      userRole !== 'admin' &&
      task.assigneeId !== userId &&
      task.project.ownerId !== userId
    ) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    return task;
  },

  createTask: async (data, userId, userRole) => {
    const projId = parseInt(data.projectId, 10);
    if (isNaN(projId) || projId <= 0) {
      throw errors.badRequest('Invalid project ID provided');
    }

    const project = await prisma.project.findUnique({
      where: { id: projId }
    });

    if (!project) {
      throw errors.notFound(messages.PROJECT.NOT_FOUND);
    }

    if (userRole !== 'admin' && project.ownerId !== userId) {
      throw errors.forbidden('Only the project owner or admin can create tasks in this project');
    }

    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw errors.badRequest('Assigned user does not exist');
      }
    }

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        status: data.status || 'todo',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: projId,
        assigneeId: data.assigneeId || null
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
  },

  updateTask: async (id, data, userId, userRole) => {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      throw errors.badRequest('Invalid task ID provided');
    }

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!existing) {
      throw errors.notFound(messages.TASK.NOT_FOUND);
    }

    if (
      userRole !== 'admin' &&
      existing.project.ownerId !== userId &&
      existing.assigneeId !== userId
    ) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    if (data.status && data.status !== existing.status) {
      const allowedNext = VALID_STATUS_TRANSITIONS[existing.status] || [];
      if (!allowedNext.includes(data.status)) {
        throw errors.badRequest(
          `Cannot transition task status directly from '${existing.status}' to '${data.status}'`
        );
      }
    }

    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw errors.badRequest('Assigned user does not exist');
      }
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null
        }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId })
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
  },

  deleteTask: async (id, userId, userRole) => {
    const taskId = parseInt(id, 10);
    if (isNaN(taskId) || taskId <= 0) {
      throw errors.badRequest('Invalid task ID provided');
    }

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!existing) {
      throw errors.notFound(messages.TASK.NOT_FOUND);
    }

    if (userRole !== 'admin' && existing.project.ownerId !== userId) {
      throw errors.forbidden('Only the project owner or admin can delete tasks');
    }

    return prisma.task.delete({
      where: { id: taskId }
    });
  }
};

module.exports = taskService;
