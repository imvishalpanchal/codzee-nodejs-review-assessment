const yup = require('yup');
const messages = require('../utils/messages');

const createCommentSchema = yup.object({
  content: yup.string().trim().required(messages.VALIDATION.CONTENT_REQUIRED).max(1000)
});

module.exports = {
  createCommentSchema
};
