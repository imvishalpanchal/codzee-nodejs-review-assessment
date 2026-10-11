const messages = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email is already registered',
  ROUTE_NOT_FOUND: 'Requested route not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  TOKEN_EXPIRED: 'Authentication token has expired',
  TOKEN_INVALID: 'Invalid authentication token',
  TOKEN_MISSING: 'Authentication token is missing',

  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    PROFILE_SUCCESS: 'User profile fetched successfully'
  },

  PROJECT: {
    FETCH_SUCCESS: 'Projects retrieved successfully',
    DETAILS_SUCCESS: 'Project details retrieved successfully',
    CREATE_SUCCESS: 'Project created successfully',
    UPDATE_SUCCESS: 'Project updated successfully',
    DELETE_SUCCESS: 'Project deleted successfully',
    NOT_FOUND: 'Project not found'
  },

  TASK: {
    FETCH_SUCCESS: 'Tasks retrieved successfully',
    DETAILS_SUCCESS: 'Task details retrieved successfully',
    CREATE_SUCCESS: 'Task created successfully',
    UPDATE_SUCCESS: 'Task updated successfully',
    DELETE_SUCCESS: 'Task deleted successfully',
    NOT_FOUND: 'Task not found'
  },

  VALIDATION: {
    NAME_REQUIRED: 'Name is required',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
    TITLE_REQUIRED: 'Title is required',
    PROJECT_ID_REQUIRED: 'Project ID is required',
    STATUS_INVALID: 'Invalid status provided',
    PRIORITY_INVALID: 'Invalid priority provided'
  }
};

module.exports = messages;
