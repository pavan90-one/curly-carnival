const crypto = require('crypto');
function createUser({ name, email, passwordHash }) { return { id: `usr_${crypto.randomUUID()}`, name: name.trim(), email: email.toLowerCase().trim(), passwordHash, createdAt: new Date().toISOString() }; }
function publicUser({ id, name, email, createdAt }) { return { id, name, email, createdAt }; }
module.exports = { createUser, publicUser };
