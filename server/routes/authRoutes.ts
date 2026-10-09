import { Router } from 'express';
import { userDao } from '../db/db';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find user in DB or provide Demo fallback
  let user = email ? userDao.getByEmail(email) : null;
  if (!user) {
    user = userDao.getById('usr_001') || {
      id: 'usr_001',
      name: 'Aarav Sharma',
      email: email || 'aarav.sharma@example.com',
      phone: '+91 98201 44521',
      bloodGroup: 'B+',
      dob: '1992-06-14',
      gender: 'Male',
      preferredLanguage: 'en',
    };
  }

  res.json({
    message: 'Authentication successful (Demo Mode enabled)',
    token: `demo_jwt_token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      dob: user.dob,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage || 'en',
      allergies: typeof user.allergies === 'string' ? JSON.parse(user.allergies) : user.allergies || ['Penicillin', 'Peanuts'],
      chronicConditions: typeof user.chronicConditions === 'string' ? JSON.parse(user.chronicConditions) : user.chronicConditions || ['Mild Asthma', 'Seasonal Rhinitis'],
      emergencyContact: {
        name: user.emergencyContactName || 'Pooja Sharma',
        relationship: user.emergencyContactRelation || 'Spouse',
        phone: user.emergencyContactPhone || '+91 98201 44522',
      },
    },
  });
});

// POST /api/v1/auth/signup
authRouter.post('/signup', (req, res) => {
  const { name, email } = req.body;

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name || 'Demo Patient',
    email: email || `patient_${Date.now()}@example.com`,
    phone: '+91 98201 00000',
    bloodGroup: 'O+',
    dob: '1995-01-01',
    gender: 'Other',
    preferredLanguage: 'en',
    allergies: [],
    chronicConditions: [],
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Family',
      phone: '+91 98201 11111',
    },
  };

  res.status(201).json({
    message: 'User registered successfully (Demo Mode enabled)',
    token: `demo_jwt_token_${newUser.id}_${Date.now()}`,
    user: newUser,
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', (req, res) => {
  const user = userDao.getById('usr_001');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      dob: user.dob,
      gender: user.gender,
      preferredLanguage: user.preferredLanguage || 'en',
      allergies: JSON.parse(user.allergies || '[]'),
      chronicConditions: JSON.parse(user.chronicConditions || '[]'),
      emergencyContact: {
        name: user.emergencyContactName,
        relationship: user.emergencyContactRelation,
        phone: user.emergencyContactPhone,
      },
    },
  });
});
