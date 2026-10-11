const yup = require('yup');
const messages = require('../utils/messages');
const { PROJECT_STATUS_OPTIONS } = require('../utils/constants');

const createProjectSchema = yup.object({
  name: yup.string().trim().required(messages.VALIDATION.TITLE_REQUIRED).max(120),
  description: yup.string().trim().nullable().optional().max(500),
  status: yup.string().oneOf(PROJECT_STATUS_OPTIONS, messages.VALIDATION.STATUS_INVALID).optional()
});

const updateProjectSchema = yup.object({
  name: yup.string().trim().optional().max(120),
  description: yup.string().trim().nullable().optional().max(500),
  status: yup.string().oneOf(PROJECT_STATUS_OPTIONS, messages.VALIDATION.STATUS_INVALID).optional()
});

module.exports = {
  createProjectSchema,
  updateProjectSchema
};
