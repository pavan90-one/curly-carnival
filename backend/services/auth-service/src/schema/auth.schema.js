function registrationError({ name, email, password } = {}) {
  if (!name || !email || !password) return 'name, email and password are required';
  return password.length < 8 ? 'Password must be at least 8 characters' : null;
}
function passwordError(password) { return !password || password.length < 8 ? 'Password must be at least 8 characters' : null; }
module.exports = { registrationError, passwordError };
