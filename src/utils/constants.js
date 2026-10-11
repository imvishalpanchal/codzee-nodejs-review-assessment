const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

const PROJECT_STATUS_OPTIONS = ['planning', 'in_progress', 'completed', 'archived'];

const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done'
};

const TASK_STATUS_OPTIONS = ['todo', 'in_progress', 'in_review', 'done'];

const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const TASK_PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member'
};

module.exports = {
  PROJECT_STATUS,
  PROJECT_STATUS_OPTIONS,
  TASK_STATUS,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY,
  TASK_PRIORITY_OPTIONS,
  USER_ROLES
};
