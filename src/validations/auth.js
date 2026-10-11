const yup = require('yup');
const { email, password } = require('./common');
const messages = require('../utils/messages');

const registerSchema = yup.object({
  name: yup.string().trim().required(messages.VALIDATION.NAME_REQUIRED),
  email: email.required(messages.VALIDATION.EMAIL_REQUIRED),
  password: password.required(messages.VALIDATION.PASSWORD_REQUIRED),
  role: yup.string().oneOf(['admin', 'member']).optional()
});

const loginSchema = yup.object({
  email: email.required(messages.VALIDATION.EMAIL_REQUIRED),
  password: yup.string().trim().required(messages.VALIDATION.PASSWORD_REQUIRED)
});

module.exports = {
  registerSchema,
  loginSchema
};
