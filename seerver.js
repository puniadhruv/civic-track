   const express = require('express');
   const connectDB = require('./config/db');
   const cors = require('cors');
   const bodyParser = require('body-parser');
   const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const User = require('../models/UserModel'); // For authRoutes
const Issue = require('../models/IssueModel'); // For issueRoutes

   require('dotenv').config();

   const app = express();

   // Connect to Database
   connectDB();

   // Middleware
   app.use(cors());
   app.use(bodyParser.json());

   // Routes
   app.use('/api/auth', authRoutes);
   app.use('/api/issues', issueRoutes);

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   