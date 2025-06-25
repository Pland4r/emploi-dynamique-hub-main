import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Save, Building, MapPin, DollarSign, Clock, GraduationCap, Briefcase } from "lucide-react";
import { jobService } from '../services/api';

interface Props {
  onBack: () => void;
  onSave: () => void;
}

const JobPostingForm = ({ onBack, onSave }: Props) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    type: "full-time",
    required_skills: [] as string[],
    experience_level: "mid"
  });
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await jobService.createJob(formData);
      onSave();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.required_skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        required_skills: [...formData.required_skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      required_skills: formData.required_skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Créer une offre d'emploi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Publication...' : 'Publier l\'offre'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Informations de base</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titre du poste *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Développeur Full Stack Senior"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Entreprise *</label>
                  <Input
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Localisation *</span>
                  </label>
                  <Input
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Paris, France"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Salaire</span>
                  </label>
                  <Input
                    value={formData.salary_range}
                    onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                    placeholder="45-55k €"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Type de contrat *</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="full-time">Temps plein</option>
                    <option value="part-time">Temps partiel</option>
                    <option value="contract">Contrat</option>
                    <option value="internship">Stage</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Description du poste</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description du poste *</label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez le poste, les responsabilités, les missions..."
                  rows={6}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Prérequis et exigences</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Exigences, prérequis, qualités recherchées..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills and Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Compétences et expérience</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Niveau d'expérience requis</label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="entry">Débutant (0-2 ans)</option>
                  <option value="mid">Intermédiaire (2-5 ans)</option>
                  <option value="senior">Senior (5-8 ans)</option>
                  <option value="lead">Lead (8+ ans)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Compétences requises</label>
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Ajouter une compétence"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.required_skills.map((skill, index) => (
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

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de l'offre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{formData.title || "Titre du poste"}</h2>
                  <p className="text-gray-600">{formData.company || "Entreprise"}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{formData.location || "Localisation"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formData.type === 'full-time' ? 'Temps plein' : 
                            formData.type === 'part-time' ? 'Temps partiel' :
                            formData.type === 'contract' ? 'Contrat' : 'Stage'}</span>
                    </div>
                    {formData.salary_range && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formData.salary_range}</span>
                      </div>
                    )}
                  </div>
                </div>

                {formData.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 text-sm">{formData.description}</p>
                  </div>
                )}

                {formData.requirements && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Prérequis</h3>
                    <p className="text-gray-700 text-sm">{formData.requirements}</p>
                  </div>
                )}

                {formData.required_skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Compétences requises</h3>
                    <div className="flex flex-wrap gap-1">
                      {formData.required_skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;
