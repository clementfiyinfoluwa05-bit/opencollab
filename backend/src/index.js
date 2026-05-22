const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Log key non-secret env values at startup to help verify deployment config
console.log('CONFIG: NODE_ENV=', process.env.NODE_ENV || 'development');
console.log('CONFIG: FRONTEND_URL=', process.env.FRONTEND_URL);
console.log('CONFIG: GOOGLE_CALLBACK_URL=', process.env.GOOGLE_CALLBACK_URL);

// This imports db.js which triggers the connection test
require('./config/db');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://opencollab-six.vercel.app',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users',    require('./routes/users'));

app.get('/', (req, res) => {
  res.json({ message: '🚀 OpenCollab API is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});