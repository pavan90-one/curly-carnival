const users = [];
const refreshTokens = new Set();
const resetTokens = new Map();
function findByEmail(email) { return users.find(user => user.email === (email || '').toLowerCase().trim()); }
function findById(id) { return users.find(user => user.id === id); }
function addUser(user) { users.push(user); return user; }
module.exports = { findByEmail, findById, addUser, refreshTokens, resetTokens };
