const express = require('express');
const cors = require('cors');
require('dotenv').config();

// This imports db.js which triggers the connection test
require('./config/db');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
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