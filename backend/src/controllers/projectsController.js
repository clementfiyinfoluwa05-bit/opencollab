const pool = require('../config/db');

// ─── GET ALL PROJECTS (with search + filters) ────────────────
// GET /api/projects?q=keyword&commitment=Casual&open=true
const getAllProjects = async (req, res) => {
  try {
    // These come from the URL query string
    // e.g. /api/projects?q=react&commitment=Casual&open=true
    const { q, commitment, open } = req.query;

    // Convert "true"/"false" string to boolean or null
    // null means "don't filter by this"
    const openFilter = open === 'true' ? true : open === 'false' ? false : null;

    const result = await pool.query(
      `SELECT 
        projects.*,
        COUNT(applications.id) AS application_count,
        users.name AS author_name
       FROM projects
       LEFT JOIN applications ON projects.id = applications.project_id
       JOIN users ON projects.user_id = users.id
       WHERE
         -- Filter by commitment if provided, otherwise show all
         ($1::text IS NULL OR projects.commitment = $1)
         -- Filter by open status if provided, otherwise show all  
         AND ($2::boolean IS NULL OR projects.is_open = $2)
         -- Full text search across name, description, stack_tags
         AND ($3::text IS NULL OR
           to_tsvector('english', projects.name || ' ' || projects.description)
           @@ plainto_tsquery('english', $3)
         )
       GROUP BY projects.id, users.name
       ORDER BY projects.created_at DESC`,
      [commitment || null, openFilter, q || null]
    );

    const projects = result.rows.map(p => ({
      ...p,
      stack_tags: typeof p.stack_tags === 'string' ? JSON.parse(p.stack_tags) : p.stack_tags || [],
      roles_needed: typeof p.roles_needed === 'string' ? JSON.parse(p.roles_needed) : p.roles_needed || []
    }));
    res.json(projects);

  } catch (err) {
    console.error('Get projects error:', err.message);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

// ─── GET SINGLE PROJECT ───────────────────────────────────────
// GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        projects.*,
        COUNT(applications.id) AS application_count,
        users.name AS author_name
       FROM projects
       LEFT JOIN applications ON projects.id = applications.project_id
       JOIN users ON projects.user_id = users.id
       WHERE projects.id = $1
       GROUP BY projects.id, users.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = result.rows[0];
    project.stack_tags = typeof project.stack_tags === 'string'
      ? JSON.parse(project.stack_tags)
      : project.stack_tags || [];
    project.roles_needed = typeof project.roles_needed === 'string'
      ? JSON.parse(project.roles_needed)
      : project.roles_needed || [];
    res.json(project);

  } catch (err) {
    console.error('Get project error:', err.message);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
};

// ─── CREATE PROJECT ───────────────────────────────────────────
// POST /api/projects (requires auth)
const createProject = async (req, res) => {
  try {
    // req.user comes from our auth middleware (the JWT token)
    const userId = req.user.id;

    const {
      name,
      description,
      stack_tags,   // array e.g. ["React", "Node.js"]
      roles_needed, // array e.g. ["Frontend Dev", "Designer"]
      commitment    // "Casual", "Part-time", or "Serious"
    } = req.body;

    // Validate required fields
    if (!name || !description || !commitment) {
      return res.status(400).json({ error: 'Name, description and commitment are required.' });
    }

    // screenshot_url comes from Cloudinary upload (optional)
    // req.file is set by multer if a file was uploaded
    const screenshot_url = req.file ? req.file.path : null;

    const result = await pool.query(
      `INSERT INTO projects 
        (user_id, name, description, stack_tags, roles_needed, commitment, screenshot_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        name,
        description,
        JSON.stringify(stack_tags || []),
        JSON.stringify(roles_needed || []),
        commitment,
        screenshot_url
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Create project error:', err.message);
    res.status(500).json({ error: 'Failed to create project.' });
  }
};

// ─── UPDATE PROJECT ───────────────────────────────────────────
// PUT /api/projects/:id (owner only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First check: does this project exist and does this user own it?
    const existing = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // If the project belongs to someone else, return 403 Forbidden
    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own projects.' });
    }

    const {
      name,
      description,
      stack_tags,
      roles_needed,
      commitment
    } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, description = $2, stack_tags = $3,
           roles_needed = $4, commitment = $5
       WHERE id = $6
       RETURNING *`,
      [
        name || existing.rows[0].name,
        description || existing.rows[0].description,
        JSON.stringify(stack_tags || existing.rows[0].stack_tags),
        JSON.stringify(roles_needed || existing.rows[0].roles_needed),
        commitment || existing.rows[0].commitment,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Update project error:', err.message);
    res.status(500).json({ error: 'Failed to update project.' });
  }
};

// ─── DELETE PROJECT ───────────────────────────────────────────
// DELETE /api/projects/:id (owner only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own projects.' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({ message: 'Project deleted successfully.' });

  } catch (err) {
    console.error('Delete project error:', err.message);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
};

// ─── TOGGLE OPEN/CLOSED ───────────────────────────────────────
// PATCH /api/projects/:id/toggle-open (owner only)
const toggleOpen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (existing.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only modify your own projects.' });
    }

    // Flip the current value — if open becomes closed, if closed becomes open
    const result = await pool.query(
      `UPDATE projects SET is_open = NOT is_open
       WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Toggle open error:', err.message);
    res.status(500).json({ error: 'Failed to toggle project status.' });
  }
};

// ─── GET APPLICATIONS FOR A PROJECT ──────────────────────────
// GET /api/projects/:id/applications (owner only)
const getApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Only the project owner can see applications
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Only the project owner can view applications.' });
    }

    // Get all applications with the applicant's name
    const result = await pool.query(
      `SELECT
        applications.*,
        users.name AS applicant_name,
        users.email AS applicant_email
       FROM applications
       JOIN users ON applications.user_id = users.id
       WHERE applications.project_id = $1
       ORDER BY applications.created_at DESC`,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Get applications error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
};

// ─── SUBMIT APPLICATION ───────────────────────────────────────
// POST /api/projects/:id/apply (requires auth)
const applyToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { message, github_url } = req.body;

    if (!message || !github_url) {
      return res.status(400).json({ error: 'Message and GitHub URL are required.' });
    }

    // Get the project
    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Block owner from applying to their own project
    if (project.rows[0].user_id === userId) {
      return res.status(400).json({ error: 'You cannot apply to your own project.' });
    }

    // Block applications to closed projects
    if (!project.rows[0].is_open) {
      return res.status(400).json({ error: 'This project is no longer accepting applications.' });
    }

    const result = await pool.query(
      `INSERT INTO applications (project_id, user_id, message, github_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, userId, message, github_url]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    // Error code 23505 = unique constraint violation
    // Means this user already applied to this project
    if (err.code === '23505') {
      return res.status(400).json({ error: 'You have already applied to this project.' });
    }
    console.error('Apply error:', err.message);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
};

module.exports = {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleOpen,
  getApplications,
  applyToProject
};
