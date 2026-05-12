const router = require('express').Router();
const pool = require('../config/db');

// GET /api/users/:id — get a user's profile and their listings
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get user info (no password hash!)
    const user = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Get all projects this user has posted
    const projects = await pool.query(
      `SELECT projects.*, COUNT(applications.id) AS application_count
       FROM projects
       LEFT JOIN applications ON projects.id = applications.project_id
       WHERE projects.user_id = $1
       GROUP BY projects.id
       ORDER BY projects.created_at DESC`,
      [id]
    );

    res.json({
      user: user.rows[0],
      projects: projects.rows
    });

  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

module.exports = router;