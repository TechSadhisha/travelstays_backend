require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const inquiryRouter = require('./routes/inquiry');

const app = express();
app.use(cors()); // Adjust origin as needed
app.use(express.json());
app.use('/api', inquiryRouter);

const PORT = process.env.PORT || 3001;

// Attempt DB connection and sync models (creates tables if they don't exist)
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync({ alter: true }); // Updates table schema if it exists
  })
  .then(() => {
    console.log('Database tables synced');
  })
  .catch(err => {
    console.warn('Database connection/sync failed:', err.message);
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
