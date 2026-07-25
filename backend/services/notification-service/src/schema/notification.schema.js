function validateNotification(input) {
  return input && input.message ? null : 'message is required';
}

module.exports = { validateNotification };
