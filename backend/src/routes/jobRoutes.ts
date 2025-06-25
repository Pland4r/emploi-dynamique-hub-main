import express from 'express';
import { createPool } from 'mysql2/promise';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'emploi_dynamique'
});

// ✅ GET job recommendations (place FIRST)
router.get('/recommendations', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can get recommendations' });
    }

    await generateJobRecommendations(req.user.id);

    const [recommendations] = await pool.execute(`
      SELECT 
        jr.*, j.title, j.company, j.location, j.salary_range, j.type,
        j.description, j.required_skills, j.experience_level
      FROM job_recommendations jr
      JOIN jobs j ON jr.job_id = j.id
      WHERE jr.user_id = ? AND j.status = 'active'
      ORDER BY jr.match_score DESC, jr.created_at DESC
      LIMIT 20
    `, [req.user.id]);

    const parsed = (recommendations as any[]).map(rec => ({
      ...rec,
      required_skills: rec.required_skills ? JSON.parse(rec.required_skills) : []
    }));

    console.log('Recommandations retournées:', parsed);
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Mark recommendation as viewed
router.put('/recommendations/:jobId/view', auth, async (req: any, res) => {
  try {
    await pool.execute(
      'UPDATE job_recommendations SET is_viewed = TRUE WHERE job_id = ? AND user_id = ?',
      [req.params.jobId, req.user.id]
    );
    res.json({ message: 'Recommendation marked as viewed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs
router.get('/', auth, async (req: any, res) => {
  try {
    let jobsQuery = `SELECT j.*, (
      SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id
    ) as applications_count
    FROM jobs j`;
    let jobsParams: any[] = [];
    if (req.user.role === 'recruiter') {
      jobsQuery += ' WHERE j.user_id = ?';
      jobsParams.push(req.user.id);
    }
    jobsQuery += ' ORDER BY j.created_at DESC';
    const [jobs] = await pool.execute(jobsQuery, jobsParams);
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get job by ID (only if ID is numeric)
router.get('/:id(\\d+)', async (req, res) => {
  try {
    const [jobs] = await pool.execute(
      'SELECT j.*, u.first_name, u.last_name FROM jobs j JOIN users u ON j.user_id = u.id WHERE j.id = ?',
      [req.params.id]
    );
    if ((jobs as any[]).length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = (jobs as any[])[0];
    job.required_skills = job.required_skills ? JSON.parse(job.required_skills) : [];
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create job
router.post('/', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can create jobs' });
    }

    const {
      title, company, description, requirements, location,
      salary_range, type, required_skills, experience_level
    } = req.body;

    const requiredSkillsJson = JSON.stringify(required_skills || []);
    const [result] = await pool.execute(
      'INSERT INTO jobs (user_id, title, company, description, requirements, location, salary_range, type, required_skills, experience_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, company, description, requirements, location, salary_range, type, requiredSkillsJson, experience_level]
    );

    res.status(201).json({ id: (result as any).insertId, message: 'Job created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update job
router.put('/:id(\\d+)', auth, async (req: any, res) => {
  try {
    const {
      title, company, description, requirements, location,
      salary_range, type, required_skills, experience_level, status
    } = req.body;

    const [result] = await pool.execute(
      'UPDATE jobs SET title = ?, company = ?, description = ?, requirements = ?, location = ?, salary_range = ?, type = ?, required_skills = ?, experience_level = ?, status = ? WHERE id = ? AND user_id = ?',
      [title, company, description, requirements, location, salary_range, type, required_skills, experience_level, status, req.params.id, req.user.id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found or not authorized' });
    }

    res.json({ message: 'Job updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job
router.delete('/:id(\\d+)', auth, async (req: any, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM jobs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found or not authorized' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Apply to job
router.post('/:id(\\d+)/apply', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can apply to jobs' });
    }

    const { cover_letter } = req.body;
    const jobId = req.params.id;
    const userId = req.user.id;

    const [existingApplications] = await pool.execute(
      'SELECT id FROM applications WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );

    if ((existingApplications as any[]).length > 0) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    const matchScore = await calculateMatchScore(userId, jobId);

    const [result] = await pool.execute(
      'INSERT INTO applications (job_id, user_id, cover_letter, match_score) VALUES (?, ?, ?, ?)',
      [jobId, userId, cover_letter, matchScore]
    );

    await pool.execute(
      'UPDATE job_recommendations SET is_applied = TRUE WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );

    res.status(201).json({
      id: (result as any).insertId,
      match_score: matchScore,
      message: 'Application submitted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get applications for a job
router.get('/:id(\\d+)/applications', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can view applications' });
    }

    const [applications] = await pool.execute(`
      SELECT a.*, u.first_name, u.last_name, u.email, p.skills, p.experience, p.education
      FROM applications a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE a.job_id = ?
      ORDER BY a.match_score DESC, a.created_at DESC
    `, [req.params.id]);

    const parsedApplications = (applications as any[]).map(app => ({
      ...app,
      skills: app.skills ? JSON.parse(app.skills) : [],
      experience: app.experience ? JSON.parse(app.experience) : [],
      education: app.education ? JSON.parse(app.education) : []
    }));

    res.json(parsedApplications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update application status
router.put('/applications/:id(\\d+)', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can update applications' });
    }

    const { status, recruiter_notes, interview_date } = req.body;

    const [result] = await pool.execute(
      'UPDATE applications SET status = ?, recruiter_notes = ?, interview_date = ? WHERE id = ?',
      [status, recruiter_notes, interview_date, req.params.id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all applications for all jobs created by the recruiter
router.get('/recruiter/applications', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Only recruiters can access this' });
    }
    // Get all jobs created by this recruiter
    const [jobs] = await pool.execute('SELECT id FROM jobs WHERE user_id = ?', [req.user.id]);
    const jobIds = (jobs as any[]).map(j => j.id);
    if (jobIds.length === 0) return res.json([]);
    // Get all applications for these jobs
    const [applications] = await pool.execute(
      `SELECT a.*, j.title FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.job_id IN (${jobIds.map(() => '?').join(',')})`,
      jobIds
    );
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save (bookmark) a job
router.post('/:id(\\d+)/save', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can save jobs' });
    }
    const jobId = req.params.id;
    const userId = req.user.id;
    // Prevent duplicate saves
    const [existing] = await pool.execute(
      'SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: 'Job already saved' });
    }
    await pool.execute(
      'INSERT INTO saved_jobs (user_id, job_id, created_at) VALUES (?, ?, NOW())',
      [userId, jobId]
    );
    res.status(201).json({ message: 'Job saved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Unsave (remove bookmark) a job
router.delete('/:id(\\d+)/save', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can unsave jobs' });
    }
    const jobId = req.params.id;
    const userId = req.user.id;
    const [result] = await pool.execute(
      'DELETE FROM saved_jobs WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Job not saved' });
    }
    res.json({ message: 'Job unsaved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check if a job is saved by the current user
router.get('/:id(\\d+)/save', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can check saved jobs' });
    }
    const jobId = req.params.id;
    const userId = req.user.id;
    const [existing] = await pool.execute(
      'SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );
    res.json({ saved: (existing as any[]).length > 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all saved jobs for the current user
router.get('/saved', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can access saved jobs' });
    }
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT j.* FROM saved_jobs s
       JOIN jobs j ON s.job_id = j.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    // Parse required_skills for each job
    const jobs = (rows as any[]).map(job => ({
      ...job,
      required_skills: job.required_skills ? JSON.parse(job.required_skills) : []
    }));
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --------- Helper Functions ---------
async function calculateMatchScore(userId: number, jobId: number): Promise<number> {
  try {
    const [profiles] = await pool.execute(
      'SELECT skills, experience FROM profiles WHERE user_id = ?',
      [userId]
    );

    if ((profiles as any[]).length === 0) return 0;

    const profile = (profiles as any[])[0];
    const userSkills = profile.skills ? JSON.parse(profile.skills) : [];
    const userExperience = profile.experience ? JSON.parse(profile.experience) : [];

    const [jobs] = await pool.execute(
      'SELECT required_skills, experience_level FROM jobs WHERE id = ?',
      [jobId]
    );

    if ((jobs as any[]).length === 0) return 0;

    const job = (jobs as any[])[0];
    const requiredSkills = job.required_skills ? JSON.parse(job.required_skills) : [];

    let skillsMatch = 0;
    if (requiredSkills.length > 0) {
      const matchedSkills = userSkills.filter((skill: string) =>
        requiredSkills.some((reqSkill: string) =>
          skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      skillsMatch = (matchedSkills.length / requiredSkills.length) * 60;
    }

    let experienceMatch = 0;
    if (userExperience.length > 0) {
      const totalYears = userExperience.reduce((total: number, exp: any) => {
        const start = new Date(exp.start_date);
        const end = exp.current ? new Date() : new Date(exp.end_date);
        return total + ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
      }, 0);

      switch (job.experience_level) {
        case 'entry':
          experienceMatch = Math.min(totalYears * 10, 40); break;
        case 'mid':
          experienceMatch = Math.min(Math.max((totalYears - 2) * 8, 0), 40); break;
        case 'senior':
          experienceMatch = Math.min(Math.max((totalYears - 5) * 6, 0), 40); break;
        case 'lead':
          experienceMatch = Math.min(Math.max((totalYears - 8) * 5, 0), 40); break;
      }
    }

    return Math.round(skillsMatch + experienceMatch);
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
}

async function generateJobRecommendations(userId: number): Promise<void> {
  try {
    const [jobs] = await pool.execute('SELECT id FROM jobs WHERE status = "active"');
    const [existing] = await pool.execute(
      'SELECT job_id FROM job_recommendations WHERE user_id = ?',
      [userId]
    );

    const existingJobIds = (existing as any[]).map(r => r.job_id);
    for (const job of jobs as any[]) {
      if (!existingJobIds.includes(job.id)) {
        const score = await calculateMatchScore(userId, job.id);
        if (score > 30) {
          await pool.execute(
            'INSERT INTO job_recommendations (user_id, job_id, match_score, reason) VALUES (?, ?, ?, ?)',
            [userId, job.id, score, `Match score: ${score}%`]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
  }
}

export default router;
export { generateJobRecommendations };

