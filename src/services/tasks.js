const prisma = require('../config/database/prismaClient');
const { errors } = require('../config/api/errorHandler');
const messages = require('../utils/messages');

const taskService = {
  getTasks: async (query = {}, userId, userRole) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (query.projectId) {
      where.projectId = parseInt(query.projectId, 10);
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
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id, 10) },
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
    const project = await prisma.project.findUnique({
      where: { id: parseInt(data.projectId, 10) }
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
        projectId: parseInt(data.projectId, 10),
        assigneeId: data.assigneeId || null
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    });
  },

  updateTask: async (id, data, userId, userRole) => {
    const existing = await prisma.task.findUnique({
      where: { id: parseInt(id, 10) },
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

    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId }
      });
      if (!assignee) {
        throw errors.badRequest('Assigned user does not exist');
      }
    }

    return prisma.task.update({
      where: { id: parseInt(id, 10) },
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
    const existing = await prisma.task.findUnique({
      where: { id: parseInt(id, 10) },
      include: { project: true }
    });

    if (!existing) {
      throw errors.notFound(messages.TASK.NOT_FOUND);
    }

    if (userRole !== 'admin' && existing.project.ownerId !== userId) {
      throw errors.forbidden('Only the project owner or admin can delete tasks');
    }

    return prisma.task.delete({
      where: { id: parseInt(id, 10) }
    });
  }
};

module.exports = taskService;
