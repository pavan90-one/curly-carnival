const { createNotification } = require('../models/notification.model');
const notifications = [];

function findAll() { return notifications; }
function create(data) { const notification = createNotification(data); notifications.push(notification); return notification; }

module.exports = { findAll, create };
