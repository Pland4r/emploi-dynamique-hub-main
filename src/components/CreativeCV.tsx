import React from "react";

interface CVProps {
  personalInfo: any;
  experiences: any[];
  education: any[];
  skills: string[];
  languages: any[];
  certifications: any[];
}

const CreativeCV: React.FC<CVProps> = ({ personalInfo, experiences, education, skills, languages, certifications }) => (
  <div className="bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 max-w-3xl mx-auto p-10 rounded-2xl shadow-lg font-sans text-gray-900">
    <div className="text-center mb-8">
      <h1 className="text-5xl font-extrabold text-pink-600 drop-shadow">{personalInfo.first_name} {personalInfo.last_name}</h1>
      <div className="text-xl text-blue-700 mt-2">{personalInfo.headline}</div>
      <div className="flex flex-wrap justify-center gap-4 mt-2 text-gray-700 text-sm">
        {personalInfo.email && <span>📧 {personalInfo.email}</span>}
        {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
        {personalInfo.address && <span>📍 {personalInfo.address}</span>}
      </div>
    </div>
    {personalInfo.summary && (
      <div className="mb-8 bg-white/80 p-4 rounded-xl border-l-8 border-pink-400">
        <strong>À propos de moi</strong>
        <div>{personalInfo.summary}</div>
      </div>
    )}
    {experiences && experiences.length > 0 && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Expérience</h2>
        {experiences.map((exp, i) => (
          <div key={i} className="mb-4 bg-white/80 p-3 rounded-lg border-l-4 border-blue-300">
            <div className="font-bold">{exp.position}</div>
            <div className="italic">{exp.company}</div>
            <div className="text-xs text-gray-500">{exp.start_date} - {exp.current ? 'Présent' : exp.end_date}</div>
            {exp.description && <div className="mt-1">{exp.description}</div>}
          </div>
        ))}
      </div>
    )}
    {education && education.length > 0 && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pink-700 mb-2">Formation</h2>
        {education.map((edu, i) => (
          <div key={i} className="mb-4 bg-white/80 p-3 rounded-lg border-l-4 border-pink-300">
            <div className="font-bold">{edu.degree} {edu.field && `en ${edu.field}`}</div>
            <div className="italic">{edu.institution}</div>
            <div className="text-xs text-gray-500">{edu.graduation_date}</div>
            {edu.description && <div className="mt-1">{edu.description}</div>}
          </div>
        ))}
      </div>
    )}
    {skills && skills.length > 0 && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yellow-700 mb-2">Compétences</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="bg-yellow-200 px-3 py-1 rounded-full text-sm text-gray-800">{skill}</span>
          ))}
        </div>
      </div>
    )}
    {languages && languages.length > 0 && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Langues</h2>
        <div className="flex flex-wrap gap-4">
          {languages.map((lang, i) => (
            <span key={i} className="bg-blue-100 px-4 py-2 rounded text-sm">{lang.language} - {lang.level}</span>
          ))}
        </div>
      </div>
    )}
    {certifications && certifications.length > 0 && (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-pink-700 mb-2">Certifications</h2>
        {certifications.map((cert, i) => (
          <div key={i} className="mb-4 bg-white/80 p-3 rounded-lg border-l-4 border-pink-300">
            <div className="font-bold">{cert.name}</div>
            <div className="italic">{cert.issuer}</div>
            <div className="text-xs text-gray-500">{cert.date}</div>
            {cert.description && <div className="mt-1">{cert.description}</div>}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default CreativeCV; 