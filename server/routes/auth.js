const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Patient Google OAuth login
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    
    let patient = await Patient.findOne({ email });
    
    if (!patient) {
      patient = new Patient({
        name,
        email,
        phone: '9853224443',
        age: 25,
        googleId,
        provider: 'google',
        symptoms: []
      });
      await patient.save();
    }
    
    const token = jwt.sign(
      { id: patient._id, role: 'patient' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: 'patient'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Doctor/Pharmacy login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Demo credentials
    const demoCredentials = {
      'doctor@test.com': { password: 'doctor123', role: 'doctor' },
      'pharmacy@test.com': { password: 'pharmacy123', role: 'pharmacy' },
      'admin@swasthai.com': { password: 'admin123', role: 'admin' }
    };
    
    const demo = demoCredentials[email];
    if (demo && demo.password === password && demo.role === role) {
      const token = jwt.sign(
        { email, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        token,
        user: { email, role, name: `Demo ${role}` }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;