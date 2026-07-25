const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const port = process.env.PORT || 4006;
const accessSecret = process.env.ACCESS_TOKEN_SECRET || 'development-access-secret-change-me';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'development-refresh-secret-change-me';
const users = [];
const refreshTokens = new Set();
const resetTokens = new Map();

function publicUser(user) { return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }; }
function issueTokens(user) {
  const payload = { sub: user.id, email: user.email };
  const accessToken = jwt.sign(payload, accessSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d', jwtid: crypto.randomUUID() });
  refreshTokens.add(refreshToken);
  return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 };
}
function required(value, label) { if (!value) throw new Error(`${label} is required`); }

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    required(name, 'name'); required(email, 'email'); required(password, 'password');
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const normalizedEmail = email.toLowerCase().trim();
    if (users.some(user => user.email === normalizedEmail)) return res.status(409).json({ error: 'Email is already registered' });
    const user = { id: `usr_${crypto.randomUUID()}`, name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), createdAt: new Date().toISOString() };
    users.push(user);
    res.status(201).json({ user: publicUser(user), ...issueTokens(user) });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(item => item.email === (email || '').toLowerCase().trim());
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ user: publicUser(user), ...issueTokens(user) });
});

app.post('/auth/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });
  try {
    const payload = jwt.verify(refreshToken, refreshSecret);
    const user = users.find(item => item.id === payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    refreshTokens.delete(refreshToken);
    res.json(issueTokens(user));
  } catch { refreshTokens.delete(refreshToken); res.status(401).json({ error: 'Expired or invalid refresh token' }); }
});

app.post('/auth/logout', (req, res) => {
  if (req.body.refreshToken) refreshTokens.delete(req.body.refreshToken);
  res.status(204).send();
});

app.post('/auth/forgot-password', (req, res) => {
  const user = users.find(item => item.email === (req.body.email || '').toLowerCase().trim());
  // Always return the same response so callers cannot enumerate accounts.
  if (!user) return res.json({ message: 'If that account exists, a reset link has been sent.' });
  const resetToken = crypto.randomBytes(32).toString('hex');
  resetTokens.set(resetToken, { userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 });
  const response = { message: 'If that account exists, a reset link has been sent.' };
  if (process.env.NODE_ENV !== 'production') response.resetToken = resetToken;
  res.json(response);
});

app.post('/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const reset = resetTokens.get(token);
  if (!reset || reset.expiresAt < Date.now()) { resetTokens.delete(token); return res.status(400).json({ error: 'Reset token is invalid or expired' }); }
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const user = users.find(item => item.id === reset.userId);
  if (!user) return res.status(400).json({ error: 'User not found' });
  user.passwordHash = await bcrypt.hash(password, 12);
  resetTokens.delete(token);
  for (const tokenToRevoke of refreshTokens) { try { if (jwt.decode(tokenToRevoke).sub === user.id) refreshTokens.delete(tokenToRevoke); } catch {} }
  res.json({ message: 'Password reset successfully' });
});

app.listen(port, () => console.log(`auth-service listening on ${port}`));
