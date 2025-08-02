   const express = require('express');
   const Issue = require('../models/IssueModel');
   const auth = require('../middleware/authmiddleware');
   const router = express.Router();

   // Report an Issue
   router.post('/', auth, async (req, res) => {
       const { title, description, location } = req.body;
       try {
           const newIssue = new Issue({ title, description, location, user: req.user.id });
           const issue = await newIssue.save();
           res.json(issue);
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   // Get All Issues
   router.get('/', async (req, res) => {
       try {
           const issues = await Issue.find().populate('user', ['username']);
           res.json(issues);
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   module.exports = router;
   