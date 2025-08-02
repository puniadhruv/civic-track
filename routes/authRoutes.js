   const express = require('express');
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');
   const User = require('../models/UserModel');
   const router = express.Router();

   // Register User
   router.post('/register', async (req, res) => {
       const { username, email, password } = req.body;
       try {
           let user = await User.findOne({ email });
           if (user) return res.status(400).json({ msg: 'User  already exists' });

           user = new User({ username, email, password: await bcrypt.hash(password, 10) });
           await user.save();

           const payload = { user: { id: user.id } };
           jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
               if (err) throw err;
               res.json({ token });
           });
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   // Login User
   router.post('/login', async (req, res) => {
       const { email, password } = req.body;
       try {
           const user = await User.findOne({ email });
           if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

           const isMatch = await bcrypt.compare(password, user.password);
           if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

           const payload = { user: { id: user.id } };
           jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
               if (err) throw err;
               res.json({ token });
           });
       } catch (err) {
           console.error(err.message);
           res.status(500).send('Server error');
       }
   });

   module.exports = router;
   