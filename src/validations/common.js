const yup = require('yup');
const messages = require('../utils/messages');

const email = yup
  .string()
  .trim()
  .email(messages.VALIDATION.EMAIL_INVALID)
  .max(100);

const password = yup
  .string()
  .trim()
  .min(6, messages.VALIDATION.PASSWORD_MIN_LENGTH);

const idParam = yup.object({
  id: yup.number().integer().positive().required()
});

module.exports = {
  email,
  password,
  idParam
};
