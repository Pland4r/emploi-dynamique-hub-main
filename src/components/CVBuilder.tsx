import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, X, Save, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Languages, Award } from "lucide-react";
import { cvService } from '../services/api';
import ModernCV from "./ModernCV";
import ClassicCV from "./ClassicCV";
import MinimalCV from "./MinimalCV";
import CreativeCV from "./CreativeCV";

interface Props {
  onBack: () => void;
  onSave: () => void;
  userId?: string;
}

interface PersonalInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  headline: string;
  summary: string;
  website?: string;
  linkedin?: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
  current: boolean;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  graduation_date: string;
  description: string;
}

interface Language {
  id: number;
  language: string;
  level: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

const CVBuilder: React.FC<Props> = ({ onBack, onSave, userId }) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    headline: "",
    summary: ""
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [template, setTemplate] = useState<"modern" | "classic" | "minimal" | "creative">("modern");
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const loadCVData = async () => {
      try {
        const data = await cvService.getCV();
        if (data) {
          setPersonalInfo(data.personalInfo || {
            id: 0,
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            address: "",
            headline: "",
            summary: ""
          });
          setExperiences(data.experiences || []);
          setEducation(data.education || []);
          setLanguages(data.languages || []);
          setCertifications(data.certifications || []);
          setSkills(data.skills || []);
          if (data.template) setTemplate(data.template);
        }
      } catch (error) {
        console.error('Error loading CV data:', error);
      }
    };

    loadCVData();
  }, []);

  const saveCV = async () => {
    try {
      const cvData = {
        personalInfo,
        experiences,
        education,
        languages,
        certifications,
        skills,
        template,
      };
      await cvService.saveCV(cvData);
      onSave();
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Error saving CV. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const cvData = {
        personalInfo,
        experiences,
        education,
        languages,
        certifications,
        skills,
      };
      const response = await cvService.generatePDF(cvData);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mon-cv.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const getTemplateStyles = () => {
    switch (template) {
      case "modern":
        return {
          container: "bg-white border-l-4 border-l-blue-500",
          header: "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200",
          title: "text-blue-900",
          section: "border-b border-gray-100 last:border-b-0",
          sectionTitle: "text-blue-700 border-b-2 border-blue-200"
        };
      case "classic":
        return {
          container: "bg-white border border-gray-300",
          header: "bg-gray-50 border-b-2 border-gray-800",
          title: "text-gray-900",
          section: "border-b border-gray-200 last:border-b-0",
          sectionTitle: "text-gray-800 border-b border-gray-400"
        };
      case "minimal":
        return {
          container: "bg-white",
          header: "border-b",
          title: "text-gray-900",
          section: "py-4",
          sectionTitle: "text-gray-900 font-light"
        };
      case "creative":
        return {
          container: "bg-white border border-gray-300",
          header: "bg-gray-50 border-b-2 border-gray-800",
          title: "text-gray-900",
          section: "border-b border-gray-200 last:border-b-0",
          sectionTitle: "text-gray-800 border-b border-gray-400"
        };
      default:
        return {
          container: "bg-white border",
          header: "border-b",
          title: "text-gray-900",
          section: "border-b border-gray-100 last:border-b-0",
          sectionTitle: "text-gray-800"
        };
    }
  };

  const styles = getTemplateStyles();

  const addExperience = () => {
    const newExperience: Experience = {
      id: experiences.length + 1,
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
      current: false
    };
    setExperiences([...experiences, newExperience]);
  };

  const updateExperience = (id: number, field: keyof Experience, value: any) => {
    setExperiences(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: number) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: education.length + 1,
      institution: "",
      degree: "",
      field: "",
      graduation_date: "",
      description: ""
    };
    setEducation([...education, newEducation]);
  };

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: number) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const addLanguage = () => {
    const newLanguage: Language = {
      id: languages.length + 1,
      language: "",
      level: ""
    };
    setLanguages([...languages, newLanguage]);
  };

  const updateLanguage = (id: number, field: keyof Language, value: string) => {
    setLanguages(languages.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  const removeLanguage = (id: number) => {
    setLanguages(languages.filter(lang => lang.id !== id));
  };

  const addCertification = () => {
    const newCertification: Certification = {
      id: certifications.length + 1,
      name: "",
      issuer: "",
      date: "",
      description: ""
    };
    setCertifications([...certifications, newCertification]);
  };

  const updateCertification = (id: number, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const removeCertification = (id: number) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Créateur de CV</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={saveCV}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Template Selection (Card UI) */}
            <Card>
              <CardHeader>
                <CardTitle>Modèle de CV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'modern', label: 'Moderne', desc: 'Design moderne et professionnel' },
                    { key: 'classic', label: 'Classique', desc: 'Style classique et élégant' },
                    { key: 'minimal', label: 'Minimal', desc: 'Minimaliste et épuré' },
                    { key: 'creative', label: 'Créatif', desc: 'Coloré et original' },
                  ].map((temp) => (
                    <div
                      key={temp.key}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        template === temp.key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setTemplate(temp.key as any)}
                    >
                      <h3 className="font-medium capitalize">{temp.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{temp.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informations personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Prénom</label>
                    <Input
                      value={personalInfo.first_name}
                      onChange={(e) => setPersonalInfo({...personalInfo, first_name: e.target.value})}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={personalInfo.last_name}
                      onChange={(e) => setPersonalInfo({...personalInfo, last_name: e.target.value})}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Titre professionnel</label>
                  <Input
                    value={personalInfo.headline}
                    onChange={(e) => setPersonalInfo({...personalInfo, headline: e.target.value})}
                    placeholder="Ex: Développeur Full Stack Senior"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                    <Input
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>Téléphone</span>
                    </label>
                    <Input
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Adresse</span>
                  </label>
                  <Input
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                    placeholder="Paris, France"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Résumé professionnel</label>
                  <Textarea
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                    placeholder="Décrivez votre profil professionnel..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Compétences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Ajouter une compétence"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{skill}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Expérience professionnelle</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Expérience {exp.id}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Entreprise</label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Nom de l'entreprise"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Poste</label>
                          <Input
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            placeholder="Titre du poste"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Date de début</label>
                          <Input
                            type="date"
                            value={exp.start_date}
                            onChange={(e) => updateExperience(exp.id, 'start_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date de fin</label>
                          <Input
                            type="date"
                            value={exp.end_date}
                            onChange={(e) => updateExperience(exp.id, 'end_date', e.target.value)}
                            disabled={exp.current}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exp.current}
                          onCheckedChange={(checked) => updateExperience(exp.id, 'current', checked)}
                        />
                        <label className="text-sm">Poste actuel</label>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder="Décrivez vos responsabilités et réalisations..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={addExperience} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une expérience
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Formation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Formation {edu.id}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Établissement</label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="Nom de l'établissement"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Diplôme</label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Ex: Master, Licence..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Domaine</label>
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            placeholder="Ex: Informatique, Marketing..."
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Date d'obtention</label>
                        <Input
                          type="date"
                          value={edu.graduation_date}
                          onChange={(e) => updateEducation(edu.id, 'graduation_date', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={edu.description}
                          onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                          placeholder="Décrivez votre formation..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={addEducation} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une formation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Languages className="h-5 w-5" />
                  <span>Langues</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex items-center space-x-4">
                      <Input
                        value={lang.language}
                        onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                        placeholder="Langue"
                        className="flex-1"
                      />
                      <Input
                        value={lang.level}
                        onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                        placeholder="Niveau"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLanguage(lang.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button onClick={addLanguage} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une langue
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Certification {cert.id}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(cert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Nom</label>
                          <Input
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                            placeholder="Nom de la certification"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Organisme</label>
                          <Input
                            value={cert.issuer}
                            onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                            placeholder="Organisme émetteur"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Date d'obtention</label>
                        <Input
                          type="date"
                          value={cert.date}
                          onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={cert.description}
                          onChange={(e) => updateCertification(cert.id, 'description', e.target.value)}
                          placeholder="Description de la certification..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={addCertification} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une certification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="sticky top-8">
            {(() => {
              const props = {
                personalInfo,
                experiences,
                education,
                skills,
                languages,
                certifications,
              };
              switch (template) {
                case "classic":
                  return <ClassicCV {...props} />;
                case "minimal":
                  return <MinimalCV {...props} />;
                case "creative":
                  return <CreativeCV {...props} />;
                case "modern":
                default:
                  return <ModernCV {...props} />;
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;