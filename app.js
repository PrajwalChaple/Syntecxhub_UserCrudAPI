const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routes
app.use('/api/users', userRoutes);

// Root route (API Info)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the User CRUD API',
    version: '1.0.0',
    documentation: '/api/users'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
