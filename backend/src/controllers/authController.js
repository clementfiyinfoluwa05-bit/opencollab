const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Helper function — creates a JWT token for a user
// We'll call this after register AND after login
const createToken = (user) => {
  return jwt.sign(
    // Payload — data stored inside the token
    { id: user.id, email: user.email, name: user.name },
    // Secret key — used to sign and verify
    process.env.JWT_SECRET,
    // Token expires in 7 days
    { expiresIn: '7d' }
  );
};

// ─── REGISTER ───────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    // Destructure the data sent from the frontend form
    const { name, email, password } = req.body;

    // Validate — make sure nothing is empty
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    // Check if email is already registered
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password — NEVER store plain text passwords
    // 10 is the "salt rounds" — higher = more secure but slower
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user into database
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, password_hash]
    );

    const user = result.rows[0];

    // Create and send back the token
    const token = createToken(user);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// ─── LOGIN ──────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Check if this user signed up with Google (no password)
    if (!user.password_hash) {
      return res.status(400).json({ error: 'This account uses Google Sign-In. Please log in with Google.' });
    }

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Password matches — create token
    const token = createToken(user);

    res.json({
      message: 'Logged in successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

module.exports = { register, login, createToken };
