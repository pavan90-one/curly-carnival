const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { accessSecret, refreshSecret } = require('../config/config');
const repository = require('../repositories/auth.repository');
const { createUser, publicUser } = require('../models/user.model');
const { registrationError, passwordError } = require('../schema/auth.schema');

function issueTokens(user) {
  const payload = { sub: user.id, email: user.email };
  const accessToken = jwt.sign(payload, accessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d', jwtid: crypto.randomUUID() });
  repository.refreshTokens.add(refreshToken);
  return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 };
}

async function register(req, res) {
  const error = registrationError(req.body);
  if (error) return res.status(400).json({ error });
  if (repository.findByEmail(req.body.email)) return res.status(409).json({ error: 'Email is already registered' });
  const user = repository.addUser(createUser({ ...req.body, passwordHash: await bcrypt.hash(req.body.password, 12) }));
  return res.status(201).json({ user: publicUser(user), ...issueTokens(user) });
}
async function login(req, res) {
  const user = repository.findByEmail(req.body.email);
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
  return res.json({ user: publicUser(user), ...issueTokens(user) });
}
function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken || !repository.refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });
  try { const user = repository.findById(jwt.verify(refreshToken, refreshSecret).sub); if (!user) throw new Error(); repository.refreshTokens.delete(refreshToken); return res.json(issueTokens(user)); }
  catch { repository.refreshTokens.delete(refreshToken); return res.status(401).json({ error: 'Expired or invalid refresh token' }); }
}
function logout(req, res) { if (req.body.refreshToken) repository.refreshTokens.delete(req.body.refreshToken); res.status(204).send(); }
function forgotPassword(req, res) {
  const user = repository.findByEmail(req.body.email); const response = { message: 'If that account exists, a reset link has been sent.' };
  if (!user) return res.json(response);
  const token = crypto.randomBytes(32).toString('hex'); repository.resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 900000 });
  if (process.env.NODE_ENV !== 'production') response.resetToken = token;
  return res.json(response);
}
async function resetPassword(req, res) {
  const reset = repository.resetTokens.get(req.body.token); const error = passwordError(req.body.password);
  if (!reset || reset.expiresAt < Date.now() || error) { if (reset && reset.expiresAt < Date.now()) repository.resetTokens.delete(req.body.token); return res.status(400).json({ error: error || 'Reset token is invalid or expired' }); }
  const user = repository.findById(reset.userId); if (!user) return res.status(400).json({ error: 'User not found' });
  user.passwordHash = await bcrypt.hash(req.body.password, 12); repository.resetTokens.delete(req.body.token);
  for (const token of repository.refreshTokens) { if (jwt.decode(token)?.sub === user.id) repository.refreshTokens.delete(token); }
  return res.json({ message: 'Password reset successfully' });
}
module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
