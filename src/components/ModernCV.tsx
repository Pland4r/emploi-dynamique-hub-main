import React from "react";

interface CVProps {
  personalInfo: any;
  experiences: any[];
  education: any[];
  skills: string[];
  languages: any[];
  certifications: any[];
}

const ModernCV: React.FC<CVProps> = ({ personalInfo, experiences, education, skills, languages, certifications }) => (
  <div className="bg-white max-w-3xl mx-auto p-8 rounded-lg shadow print:shadow-none print:p-0 print:bg-white">
    <div className="text-center border-b-4 border-blue-600 pb-6 mb-8">
      <div className="text-4xl font-bold text-blue-900 mb-2">{personalInfo.first_name} {personalInfo.last_name}</div>
      {personalInfo.headline && <div className="text-lg text-gray-500 mb-2">{personalInfo.headline}</div>}
      <div className="flex flex-wrap justify-center gap-4 text-gray-500 text-sm">
        {personalInfo.email && <span>📧 {personalInfo.email}</span>}
        {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
        {personalInfo.address && <span>📍 {personalInfo.address}</span>}
      </div>
    </div>
    {personalInfo.summary && (
      <div className="mb-8">
        <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
          <strong>Résumé professionnel</strong><br />
          {personalInfo.summary}
        </div>
      </div>
    )}
    {experiences && experiences.length > 0 && (
      <div className="mb-8">
        <div className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-1 mb-4">Expérience professionnelle</div>
        {experiences.map((exp, i) => (
          <div key={i} className="mb-4 pl-4 border-l-4 border-gray-200">
            <div className="font-bold text-gray-800">{exp.position}</div>
            <div className="italic text-gray-500">{exp.company}</div>
            <div className="text-xs text-gray-400">{exp.start_date} - {exp.current ? 'Présent' : exp.end_date}</div>
            {exp.description && <div className="mt-1 text-gray-700">{exp.description}</div>}
          </div>
        ))}
      </div>
    )}
    {education && education.length > 0 && (
      <div className="mb-8">
        <div className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-1 mb-4">Formation</div>
        {education.map((edu, i) => (
          <div key={i} className="mb-4 pl-4 border-l-4 border-gray-200">
            <div className="font-bold text-gray-800">{edu.degree} {edu.field && `en ${edu.field}`}</div>
            <div className="italic text-gray-500">{edu.institution}</div>
            <div className="text-xs text-gray-400">{edu.graduation_date}</div>
            {edu.description && <div className="mt-1 text-gray-700">{edu.description}</div>}
          </div>
        ))}
      </div>
    )}
    {skills && skills.length > 0 && (
      <div className="mb-8">
        <div className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-1 mb-4">Compétences</div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-800">{skill}</span>
          ))}
        </div>
      </div>
    )}
    {languages && languages.length > 0 && (
      <div className="mb-8">
        <div className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-1 mb-4">Langues</div>
        <div className="flex flex-wrap gap-4">
          {languages.map((lang, i) => (
            <span key={i} className="bg-gray-100 px-4 py-2 rounded text-sm">{lang.language} - {lang.level}</span>
          ))}
        </div>
      </div>
    )}
    {certifications && certifications.length > 0 && (
      <div className="mb-8">
        <div className="text-xl font-semibold text-blue-900 border-b-2 border-gray-200 pb-1 mb-4">Certifications</div>
        {certifications.map((cert, i) => (
          <div key={i} className="mb-4 pl-4 border-l-4 border-gray-200">
            <div className="font-bold text-gray-800">{cert.name}</div>
            <div className="italic text-gray-500">{cert.issuer}</div>
            <div className="text-xs text-gray-400">{cert.date}</div>
            {cert.description && <div className="mt-1 text-gray-700">{cert.description}</div>}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ModernCV; 