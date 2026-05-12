const jwt = require('jsonwebtoken');

// This function runs before any protected route
// It checks: "does this person have a valid token?"
module.exports = (req, res, next) => {

  // Tokens are sent in the request header like:
  // Authorization: Bearer eyJhbGci...
  const authHeader = req.headers.authorization;

  // If there's no token at all, reject immediately
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  // Extract just the token part (remove "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify checks the token is real and not expired
    // If it fails, it throws an error caught below
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user's data to the request
    // Now any route after this can access req.user
    req.user = decoded;

    // next() means "ok, continue to the actual route"
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};
