const prisma = require('../config/database/prismaClient');
const { errors } = require('../config/api/errorHandler');
const messages = require('../utils/messages');

const projectService = {
  getProjects: async (userId, userRole, query = {}) => {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (userRole !== 'admin') {
      where.ownerId = userId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.name = { contains: query.search };
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { tasks: true }
          }
        }
      })
    ]);

    return { projects, total, page, limit };
  },

  getProjectById: async (id, userId, userRole) => {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!project) {
      throw errors.notFound(messages.PROJECT.NOT_FOUND);
    }

    if (userRole !== 'admin' && project.ownerId !== userId) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    return project;
  },

  createProject: async (data, userId) => {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'planning',
        ownerId: userId
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });
  },

  updateProject: async (id, data, userId, userRole) => {
    const existing = await prisma.project.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!existing) {
      throw errors.notFound(messages.PROJECT.NOT_FOUND);
    }

    if (userRole !== 'admin' && existing.ownerId !== userId) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    return prisma.project.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status })
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });
  },

  deleteProject: async (id, userId, userRole) => {
    const existing = await prisma.project.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!existing) {
      throw errors.notFound(messages.PROJECT.NOT_FOUND);
    }

    if (userRole !== 'admin' && existing.ownerId !== userId) {
      throw errors.forbidden(messages.FORBIDDEN);
    }

    return prisma.project.delete({
      where: { id: parseInt(id, 10) }
    });
  }
};

module.exports = projectService;
