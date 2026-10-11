const yup = require('yup');
const messages = require('../utils/messages');
const { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } = require('../utils/constants');

const createTaskSchema = yup.object({
  title: yup.string().trim().required(messages.VALIDATION.TITLE_REQUIRED).max(150),
  description: yup.string().trim().nullable().optional().max(1000),
  priority: yup.string().oneOf(TASK_PRIORITY_OPTIONS, messages.VALIDATION.PRIORITY_INVALID).optional(),
  status: yup.string().oneOf(TASK_STATUS_OPTIONS, messages.VALIDATION.STATUS_INVALID).optional(),
  dueDate: yup.date().nullable().optional(),
  projectId: yup.number().integer().positive().required(messages.VALIDATION.PROJECT_ID_REQUIRED),
  assigneeId: yup.string().trim().nullable().optional()
});

const updateTaskSchema = yup.object({
  title: yup.string().trim().optional().max(150),
  description: yup.string().trim().nullable().optional().max(1000),
  priority: yup.string().oneOf(TASK_PRIORITY_OPTIONS, messages.VALIDATION.PRIORITY_INVALID).optional(),
  status: yup.string().oneOf(TASK_STATUS_OPTIONS, messages.VALIDATION.STATUS_INVALID).optional(),
  dueDate: yup.date().nullable().optional(),
  assigneeId: yup.string().trim().nullable().optional()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema
};
