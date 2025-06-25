import React from "react";

interface CVProps {
  personalInfo: any;
  experiences: any[];
  education: any[];
  skills: string[];
  languages: any[];
  certifications: any[];
}

const MinimalCV: React.FC<CVProps> = ({ personalInfo, experiences, education, skills, languages, certifications }) => (
  <div className="bg-white max-w-3xl mx-auto p-8 rounded-lg shadow print:shadow-none print:p-0 print:bg-white font-sans text-gray-900">
    <h1 className="text-3xl font-bold mb-1">{personalInfo.first_name} {personalInfo.last_name}</h1>
    <div className="text-base text-gray-600 mb-2">{personalInfo.headline}</div>
    <div className="text-sm text-gray-500 mb-6">{personalInfo.email} | {personalInfo.phone} | {personalInfo.address}</div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Résumé</h2>
      <div>{personalInfo.summary}</div>
    </div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Expérience</h2>
      {experiences && experiences.map((exp, i) => (
        <div key={i} className="mb-2">
          <div>{exp.position} chez {exp.company} ({exp.start_date} - {exp.current ? 'Présent' : exp.end_date})</div>
          <div>{exp.description}</div>
        </div>
      ))}
    </div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Formation</h2>
      {education && education.map((edu, i) => (
        <div key={i} className="mb-2">
          <div>{edu.degree} à {edu.institution} ({edu.graduation_date})</div>
          <div>{edu.description}</div>
        </div>
      ))}
    </div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Compétences</h2>
      <div className="flex flex-wrap gap-2 mt-1">
        {skills && skills.map((skill, i) => (
          <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">{skill}</span>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Langues</h2>
      <div className="flex flex-wrap gap-2 mt-1">
        {languages && languages.map((lang, i) => (
          <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">{lang.language} ({lang.level})</span>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Certifications</h2>
      {certifications && certifications.map((cert, i) => (
        <div key={i} className="mb-2">
          <div>{cert.name} - {cert.issuer} ({cert.date})</div>
          <div>{cert.description}</div>
        </div>
      ))}
    </div>
  </div>
);

export default MinimalCV; 