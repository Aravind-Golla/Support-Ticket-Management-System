const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];
const ALLOWED_STATUSES = ['open', 'in_progress', 'closed'];
const ALLOWED_SORT_COLUMNS = ['id', 'subject', 'priority', 'status', 'created_at', 'updated_at'];
const ALLOWED_SORT_ORDERS = ['ASC', 'DESC'];

function isNonEmptyString(value, min = 1, max = 10000) {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
}

function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim().toLowerCase());
}

module.exports = {
  EMAIL_REGEX,
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  ALLOWED_SORT_COLUMNS,
  ALLOWED_SORT_ORDERS,
  isNonEmptyString,
  isValidEmail,
};
