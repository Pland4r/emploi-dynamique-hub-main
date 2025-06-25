import express from 'express';
import { createPool } from 'mysql2/promise';
import { auth } from '../middleware/auth';
import puppeteer from 'puppeteer';
import { generateJobRecommendations } from './jobRoutes';

const router = express.Router();
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'emploi_dynamique'
});

// Save or Update CV
router.post('/', auth, async (req: any, res) => {
  try {
    const { personalInfo, experiences, education, skills, languages, certifications, template } = req.body;
    const userId = req.user.id;
    // Préparer les champs
    const first_name = personalInfo?.first_name || '';
    const last_name = personalInfo?.last_name || '';
    const email = personalInfo?.email || '';
    const phone = personalInfo?.phone || '';
    const address = personalInfo?.address || '';
    const headline = personalInfo?.headline || '';
    const summary = personalInfo?.summary || '';
    const website = personalInfo?.website || '';
    const linkedin = personalInfo?.linkedin || '';
    const skillsJson = JSON.stringify(skills || []);
    const experienceJson = JSON.stringify(experiences || []);
    const educationJson = JSON.stringify(education || []);
    const languagesJson = JSON.stringify(languages || []);
    const certificationsJson = JSON.stringify(certifications || []);
    const selectedTemplate = template || 'modern';
    // Vérifier si le profil existe
    const [existingProfiles] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    if ((existingProfiles as any[]).length === 0) {
      // Insert
      await pool.execute(
        `INSERT INTO profiles (user_id, first_name, last_name, email, phone, address, headline, bio, website, linkedin, skills, experience, education, languages, certifications, template)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, first_name, last_name, email, phone, address, headline, summary, website, linkedin, skillsJson, experienceJson, educationJson, languagesJson, certificationsJson, selectedTemplate]
      );
    } else {
      // Update
      await pool.execute(
        `UPDATE profiles SET first_name=?, last_name=?, email=?, phone=?, address=?, headline=?, bio=?, website=?, linkedin=?, skills=?, experience=?, education=?, languages=?, certifications=?, template=? WHERE user_id=?`,
        [first_name, last_name, email, phone, address, headline, summary, website, linkedin, skillsJson, experienceJson, educationJson, languagesJson, certificationsJson, selectedTemplate, userId]
      );
    }
    // Générer les recommandations après modification du CV
    await generateJobRecommendations(userId);
    res.status(200).json({ message: 'CV saved and recommendations updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get CV
router.get('/', auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const [profiles] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    const profile = (profiles as any[])[0];
    if (!profile) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const parsedProfile = {
      personalInfo: {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        headline: profile.headline || '',
        summary: profile.bio || '',
        website: profile.website || '',
        linkedin: profile.linkedin || ''
      },
      experiences: profile.experience ? JSON.parse(profile.experience) : [],
      education: profile.education ? JSON.parse(profile.education) : [],
      languages: profile.languages ? JSON.parse(profile.languages) : [],
      certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
      skills: profile.skills ? JSON.parse(profile.skills) : [],
      template: profile.template || 'modern',
    };
    res.status(200).json(parsedProfile);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Generate PDF
router.post('/generate-pdf', auth, async (req: any, res) => {
  try {
    const { personalInfo, experience, education, skills, languages, certifications, template = 'modern' } = req.body;
    console.log('PDF template:', template);
    let htmlContent;
    if (template === 'creative') {
      htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>CV - ${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 0;
          }
          .cv-container {
            max-width: 800px;
            margin: 40px auto;
            background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 50%, #fef9c3 100%);
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 40px 32px;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .name {
            font-size: 2.8em;
            font-weight: bold;
            color: #c026d3;
            margin-bottom: 0.2em;
            text-shadow: 1px 2px 0 #fff;
          }
          .headline {
            font-size: 1.3em;
            color: #2563eb;
            margin-bottom: 0.5em;
          }
          .contact {
            color: #444;
            font-size: 1em;
            margin-bottom: 0.5em;
          }
          .section-title {
            font-size: 1.5em;
            font-weight: bold;
            color: #2563eb;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .experience, .skills, .languages {
            margin-bottom: 1.2em;
          }
          .exp-card {
            background: #fff;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          .exp-title {
            font-weight: bold;
            color: #1e293b;
          }
          .exp-company {
            font-style: italic;
            color: #64748b;
          }
          .exp-dates {
            color: #64748b;
            font-size: 0.95em;
          }
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .skill {
            background: #fde047;
            color: #78350f;
            border-radius: 8px;
            padding: 4px 14px;
            font-size: 1em;
            font-weight: 500;
          }
          .lang-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .lang {
            background: #dbeafe;
            color: #1d4ed8;
            border-radius: 8px;
            padding: 4px 14px;
            font-size: 1em;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <div class="header">
            <div class="name">${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</div>
            <div class="headline">${personalInfo?.headline || ''}</div>
            <div class="contact">
              ${personalInfo?.email ? `📧 ${personalInfo.email}` : ''}
              ${personalInfo?.phone ? ` &nbsp; 📞 ${personalInfo.phone}` : ''}
              ${personalInfo?.address ? ` &nbsp; 📍 ${personalInfo.address}` : ''}
            </div>
          </div>
          <div class="section-title">Expérience</div>
          ${(experience || []).map((exp: any) => `
            <div class="exp-card">
              <div class="exp-title">${exp.position || ''}</div>
              <div class="exp-company">${exp.company || ''}</div>
              <div class="exp-dates">${exp.start_date || ''} - ${exp.current ? 'Présent' : exp.end_date || ''}</div>
              ${exp.description ? `<div>${exp.description}</div>` : ''}
            </div>
          `).join('')}
          <div class="section-title" style="color:#ca8a04;">Compétences</div>
          <div class="skills-list">
            ${(skills || []).map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
          </div>
          <div class="section-title">Langues</div>
          <div class="lang-list">
            ${(languages || []).map((lang: any) => `<span class="lang">${lang.language} - ${lang.level}</span>`).join('')}
          </div>
        </div>
      </body>
      </html>
      `;
    } else if (template === 'classic') {
      htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>CV - ${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</title>
        <style>
          body { font-family: 'Times New Roman', serif; color: #222; background: #fff; max-width: 800px; margin: 0 auto; padding: 32px; }
          h1, h2 { font-family: 'Times New Roman', serif; }
          h1 { font-size: 2.2em; border-bottom: 2px solid #222; margin-bottom: 0.5em; }
          h2 { font-size: 1.3em; margin-top: 2em; border-bottom: 1px solid #bbb; }
          .section { margin-bottom: 1.5em; }
          .label { font-weight: bold; }
          .skills, .languages { margin-top: 0.5em; }
          .skill, .language { display: inline-block; background: #eee; color: #333; border-radius: 4px; padding: 2px 10px; margin: 2px 4px 2px 0; font-size: 0.95em; }
        </style>
      </head>
      <body>
        <h1>${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</h1>
        <div>${personalInfo?.headline || ''}</div>
        <div>${personalInfo?.email || ''} | ${personalInfo?.phone || ''} | ${personalInfo?.address || ''}</div>
        <div class="section">
          <h2>Résumé</h2>
          <div>${personalInfo?.summary || ''}</div>
        </div>
        <div class="section">
          <h2>Expérience professionnelle</h2>
          ${(experience || []).map((exp: any) => `
            <div><span class="label">${exp.position || ''}</span> chez ${exp.company || ''} (${exp.start_date || ''} - ${exp.current ? 'Présent' : exp.end_date || ''})</div>
            <div>${exp.description || ''}</div>
          `).join('')}
        </div>
        <div class="section">
          <h2>Formation</h2>
          ${(education || []).map((edu: any) => `
            <div><span class="label">${edu.degree || ''}</span> à ${edu.institution || ''} (${edu.graduation_date || ''})</div>
            <div>${edu.description || ''}</div>
          `).join('')}
        </div>
        <div class="section">
          <h2>Compétences</h2>
          <div class="skills">${(skills || []).map((skill: string) => `<span class="skill">${skill}</span>`).join('')}</div>
        </div>
        <div class="section">
          <h2>Langues</h2>
          <div class="languages">${(languages || []).map((lang: any) => `<span class="language">${lang.language} (${lang.level})</span>`).join('')}</div>
        </div>
        <div class="section">
          <h2>Certifications</h2>
          ${(certifications || []).map((cert: any) => `
            <div><span class="label">${cert.name || ''}</span> - ${cert.issuer || ''} (${cert.date || ''})</div>
            <div>${cert.description || ''}</div>
          `).join('')}
        </div>
      </body>
      </html>
      `;
    } else if (template === 'minimal') {
      htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>CV - ${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #222; background: #fff; max-width: 800px; margin: 0 auto; padding: 32px; }
          h1 { font-size: 2em; margin-bottom: 0.2em; }
          h2 { font-size: 1.1em; margin-top: 1.5em; color: #444; }
          .section { margin-bottom: 1em; }
          .skills, .languages { margin-top: 0.5em; }
          .skill, .language { display: inline-block; background: #f3f3f3; color: #222; border-radius: 3px; padding: 2px 8px; margin: 2px 4px 2px 0; font-size: 0.95em; }
        </style>
      </head>
      <body>
        <h1>${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</h1>
        <div>${personalInfo?.headline || ''}</div>
        <div>${personalInfo?.email || ''} | ${personalInfo?.phone || ''} | ${personalInfo?.address || ''}</div>
        <div class="section">
          <h2>Résumé</h2>
          <div>${personalInfo?.summary || ''}</div>
        </div>
        <div class="section">
          <h2>Expérience</h2>
          ${(experience || []).map((exp: any) => `
            <div>${exp.position || ''} chez ${exp.company || ''} (${exp.start_date || ''} - ${exp.current ? 'Présent' : exp.end_date || ''})</div>
            <div>${exp.description || ''}</div>
          `).join('')}
        </div>
        <div class="section">
          <h2>Formation</h2>
          ${(education || []).map((edu: any) => `
            <div>${edu.degree || ''} à ${edu.institution || ''} (${edu.graduation_date || ''})</div>
            <div>${edu.description || ''}</div>
          `).join('')}
        </div>
        <div class="section">
          <h2>Compétences</h2>
          <div class="skills">${(skills || []).map((skill: string) => `<span class="skill">${skill}</span>`).join('')}</div>
        </div>
        <div class="section">
          <h2>Langues</h2>
          <div class="languages">${(languages || []).map((lang: any) => `<span class="language">${lang.language} (${lang.level})</span>`).join('')}</div>
        </div>
        <div class="section">
          <h2>Certifications</h2>
          ${(certifications || []).map((cert: any) => `
            <div>${cert.name || ''} - ${cert.issuer || ''} (${cert.date || ''})</div>
            <div>${cert.description || ''}</div>
          `).join('')}
        </div>
      </body>
      </html>
      `;
    } else {
      // Modern (default)
      htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>CV - ${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .name {
            font-size: 2.5em;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .title {
            font-size: 1.2em;
            color: #6b7280;
            margin-bottom: 15px;
          }
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            font-size: 0.9em;
            color: #6b7280;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .experience-item, .education-item {
            margin-bottom: 20px;
            padding-left: 20px;
            border-left: 3px solid #e5e7eb;
          }
          .job-title, .degree {
            font-weight: bold;
            font-size: 1.1em;
            color: #374151;
          }
          .company, .institution {
            color: #6b7280;
            font-style: italic;
          }
          .date {
            color: #9ca3af;
            font-size: 0.9em;
          }
          .description {
            margin-top: 10px;
            color: #4b5563;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .skill {
            background-color: #e5e7eb;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.9em;
            color: #374151;
          }
          .languages {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .language {
            background-color: #f3f4f6;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.9em;
          }
          .summary {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${personalInfo?.first_name || ''} ${personalInfo?.last_name || ''}</div>
          ${personalInfo?.headline ? `<div class="title">${personalInfo.headline}</div>` : ''}
          <div class="contact-info">
            ${personalInfo?.email ? `<span>📧 ${personalInfo.email}</span>` : ''}
            ${personalInfo?.phone ? `<span>📞 ${personalInfo.phone}</span>` : ''}
            ${personalInfo?.address ? `<span>📍 ${personalInfo.address}</span>` : ''}
          </div>
        </div>

        ${personalInfo?.summary ? `
        <div class="section">
          <div class="summary">
            <strong>Résumé professionnel</strong><br>
            ${personalInfo.summary}
          </div>
        </div>
        ` : ''}

        ${experience && experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Expérience professionnelle</div>
          ${experience.map((exp: any) => `
            <div class="experience-item">
              <div class="job-title">${exp.position || ''}</div>
              <div class="company">${exp.company || ''}</div>
              <div class="date">${exp.start_date || ''} - ${exp.current ? 'Présent' : exp.end_date || ''}</div>
              ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${education && education.length > 0 ? `
        <div class="section">
          <div class="section-title">Formation</div>
          ${education.map((edu: any) => `
            <div class="education-item">
              <div class="degree">${edu.degree || ''} ${edu.field ? `en ${edu.field}` : ''}</div>
              <div class="institution">${edu.institution || ''}</div>
              <div class="date">${edu.graduation_date || ''}</div>
              ${edu.description ? `<div class="description">${edu.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${skills && skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Compétences</div>
          <div class="skills">
            ${skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${languages && languages.length > 0 ? `
        <div class="section">
          <div class="section-title">Langues</div>
          <div class="languages">
            ${languages.map((lang: any) => `<span class="language">${lang.language} - ${lang.level}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${certifications && certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${certifications.map((cert: any) => `
            <div class="experience-item">
              <div class="job-title">${cert.name || ''}</div>
              <div class="company">${cert.issuer || ''}</div>
              <div class="date">${cert.date || ''}</div>
              ${cert.description ? `<div class="description">${cert.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </body>
      </html>
    `;
    }

    // Launch browser and generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="mon-cv.pdf"',
    });
    res.end(pdfBuffer);

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get('/recommendations', auth, async (req: any, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Only candidates can get recommendations' });
    }

    // Generate recommendations if they don't exist
    await generateJobRecommendations(req.user.id);

    const [recommendations] = await pool.execute(`
      SELECT 
        jr.*,
        j.title,
        j.company,
        j.location,
        j.salary_range,
        j.type,
        j.description,
        j.required_skills,
        j.experience_level
      FROM job_recommendations jr
      JOIN jobs j ON jr.job_id = j.id
      WHERE jr.user_id = ? AND j.status = 'active'
      ORDER BY jr.match_score DESC, jr.created_at DESC
      LIMIT 20
    `, [req.user.id]);

    // Parse required_skills
    const parsedRecommendations = (recommendations as any[]).map(rec => ({
      ...rec,
      required_skills: rec.required_skills ? JSON.parse(rec.required_skills) : []
    }));

    // Correction ici : retourner un tableau vide si aucune recommandation
    res.json(parsedRecommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 