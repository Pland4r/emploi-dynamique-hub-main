import React from "react";

interface CVProps {
  personalInfo: any;
  experiences: any[];
  education: any[];
  skills: string[];
  languages: any[];
  certifications: any[];
}

const ClassicCV: React.FC<CVProps> = ({ personalInfo, experiences, education, skills, languages, certifications }) => (
  <div className="bg-white max-w-3xl mx-auto p-8 rounded-lg shadow print:shadow-none print:p-0 print:bg-white" style={{ fontFamily: 'Times New Roman, serif', color: '#222' }}>
    <h1 style={{ fontSize: '2.2em', borderBottom: '2px solid #222', marginBottom: '0.5em', fontFamily: 'Times New Roman, serif' }}>
      {personalInfo.first_name} {personalInfo.last_name}
    </h1>
    <div>{personalInfo.headline}</div>
    <div>{personalInfo.email} | {personalInfo.phone} | {personalInfo.address}</div>
    <div className="mt-6 mb-4">
      <h2 style={{ fontSize: '1.3em', marginTop: '2em', borderBottom: '1px solid #bbb', fontFamily: 'Times New Roman, serif' }}>Résumé</h2>
      <div>{personalInfo.summary}</div>
    </div>
    <div className="mb-4">
      <h2 style={{ fontSize: '1.3em', marginTop: '2em', borderBottom: '1px solid #bbb', fontFamily: 'Times New Roman, serif' }}>Expérience professionnelle</h2>
      {experiences && experiences.map((exp, i) => (
        <div key={i} className="mb-2">
          <div style={{ fontWeight: 'bold' }}>{exp.position}</div> chez {exp.company} ({exp.start_date} - {exp.current ? 'Présent' : exp.end_date})
          <div>{exp.description}</div>
        </div>
      ))}
    </div>
    <div className="mb-4">
      <h2 style={{ fontSize: '1.3em', marginTop: '2em', borderBottom: '1px solid #bbb', fontFamily: 'Times New Roman, serif' }}>Formation</h2>
      {education && education.map((edu, i) => (
        <div key={i} className="mb-2">
          <div style={{ fontWeight: 'bold' }}>{edu.degree}</div> à {edu.institution} ({edu.graduation_date})
          <div>{edu.description}</div>
        </div>
      ))}
    </div>
    <div className="mb-4">
      <h2 style={{ fontSize: '1.3em', marginTop: '2em', borderBottom: '1px solid #bbb', fontFamily: 'Times New Roman, serif' }}>Compétences</h2>
      <div className="mt-2">
        {skills && skills.map((skill, i) => (
          <span key={i} style={{ display: 'inline-block', background: '#eee', color: '#333', borderRadius: 4, padding: '2px 10px', margin: '2px 4px 2px 0', fontSize: '0.95em' }}>{skill}</span>
        ))}
      </div>
    </div>
    <div className="mb-4">
      <h2 style={{ fontSize: '1.3em', marginTop: '2em', borderBottom: '1px solid #bbb', fontFamily: 'Times New Roman, serif' }}>Langues</h2>
      <div className="mt-2">
        {languages && languages.map((lang, i) => (
          <span key={i} style={{ display: 'inline-block', background: '#eee', color: '#333', borderRadius: 4, padding: '2px 10px', margin: '2px 4px 2px 0', fontSize: '0.95em' }}>{lang.language} ({lang.level})</span>
        ))}
      </div>
    </div>
    <div className="mb-4">
      <h2 style={{ fontSize: '1.3em', marginTop: '2em', borderBottom: '1px solid #bbb', fontFamily: 'Times New Roman, serif' }}>Certifications</h2>
      {certifications && certifications.map((cert, i) => (
        <div key={i} className="mb-2">
          <div style={{ fontWeight: 'bold' }}>{cert.name}</div> - {cert.issuer} ({cert.date})
          <div>{cert.description}</div>
        </div>
      ))}
    </div>
  </div>
);

export default ClassicCV; 