const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../config/cloudinary');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleOpen,
  getApplications,
  applyToProject
} = require('../controllers/projectsController');

// Rate limiter for creating projects
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: { error: 'Too many listings created. Wait before posting again.' }
});

// Rate limiter for applying
const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  message: { error: 'Too many applications sent. Please wait.' }
});

// Public routes — no login needed
router.get('/',     getAllProjects);
router.get('/:id',  getProject);

// Protected routes — must be logged in
// upload.single('screenshot') handles optional image upload
router.post('/',         auth, createLimiter, upload.single('screenshot'), createProject);
router.put('/:id',       auth, updateProject);
router.delete('/:id',    auth, deleteProject);
router.patch('/:id/toggle-open',    auth, toggleOpen);
router.post('/:id/apply',           auth, applyLimiter, applyToProject);
router.get('/:id/applications',     auth, getApplications);

module.exports = router;