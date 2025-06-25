import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createPool } from 'mysql2/promise';
import { auth } from '../middleware/auth';

const router = express.Router();
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'emploi_dynamique'
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password, name, userType, companyInfo } = req.body;
    
    if (!email || !password || !name || !userType) {
      console.log('Missing required fields:', { email, password, name, userType });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate recruiter-specific fields
    if (userType === 'recruiter' && (!companyInfo?.companyName || !companyInfo?.jobTitle)) {
      console.log('Missing recruiter fields:', companyInfo);
      return res.status(400).json({ error: 'Company name and job title are required for recruiters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, name, '', userType]
      );
      console.log('User inserted successfully:', userResult);

      const userId = (userResult as any).insertId;

      // If recruiter, insert company info
      if (userType === 'recruiter') {
        await connection.execute(
          'INSERT INTO profiles (user_id, company_name, job_title) VALUES (?, ?, ?)',
          [userId, companyInfo.companyName, companyInfo.jobTitle]
        );
        console.log('Recruiter profile created successfully');
      }

      await connection.commit();
      console.log('Transaction committed successfully');

      const token = jwt.sign(
        { id: userId, email, role: userType },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '24h' }
      );
      console.log('Token generated successfully');

      res.status(201).json({ 
        token,
        user: {
          id: userId,
          email,
          name,
          type: userType,
          ...(userType === 'recruiter' && {
            companyName: companyInfo.companyName,
            jobTitle: companyInfo.jobTitle
          })
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    console.log('User query result:', users);

    const user = (users as any[])[0];

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );
    console.log('Login successful for user:', email);

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req: any, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = (users as any[])[0];

    // Get profile data
    const [profiles] = await pool.execute(
      'SELECT * FROM profiles WHERE user_id = ?',
      [req.user.id]
    );

    const profile = (profiles as any[])[0];

    res.json({
      user,
      profile: profile ? {
        ...profile,
        skills: profile.skills ? JSON.parse(profile.skills) : [],
        experience: profile.experience ? JSON.parse(profile.experience) : [],
        education: profile.education ? JSON.parse(profile.education) : [],
        languages: profile.languages ? JSON.parse(profile.languages) : [],
        certifications: profile.certifications ? JSON.parse(profile.certifications) : []
      } : null
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req: any, res) => {
  try {
    const { first_name, last_name, phone, address, bio, company_name, job_title } = req.body;

    // Update user
    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      [first_name, last_name, req.user.id]
    );

    // Update or create profile
    const [profiles] = await pool.execute(
      'SELECT id FROM profiles WHERE user_id = ?',
      [req.user.id]
    );

    if ((profiles as any[]).length === 0) {
      await pool.execute(
        'INSERT INTO profiles (user_id, phone, address, bio, company_name, job_title) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, phone, address, bio, company_name, job_title]
      );
    } else {
      await pool.execute(
        'UPDATE profiles SET phone = ?, address = ?, bio = ?, company_name = ?, job_title = ? WHERE user_id = ?',
        [phone, address, bio, company_name, job_title, req.user.id]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get user applications
router.get('/applications', auth, async (req: any, res) => {
  try {
    const [applications] = await pool.execute(`
      SELECT 
        a.*,
        j.title as job_title,
        j.company,
        j.location,
        j.salary_range
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [req.user.id]);

    res.json(applications);
  } catch (error: any) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router; 