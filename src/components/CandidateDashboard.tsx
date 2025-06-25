import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Download, Edit, Star, Briefcase, Eye, TrendingUp, MapPin, Clock, DollarSign } from "lucide-react";
import CVBuilder from "./CVBuilder";
import { useToast } from "@/hooks/use-toast";
import { jobService, applicationService } from "@/services/api";
import { Link, useNavigate } from "react-router-dom";

interface Props {
  onBack: () => void;
}

interface JobRecommendation {
  id: number;
  job_id: number;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  type: string;
  description: string;
  required_skills: string[];
  experience_level: string;
  match_score: number;
  reason: string;
  is_viewed: boolean;
  is_applied: boolean;
  created_at: string;
}

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  company: string;
  status: string;
  match_score: number;
  applied_date: string;
}

const CandidateDashboard = ({ onBack }: Props) => {
  const [showCVBuilder, setShowCVBuilder] = useState(false);
  const [hasCV, setHasCV] = useState(false);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [recsData, appsData] = await Promise.all([
        jobService.getRecommendations(),
        applicationService.getUserApplications()
      ]);
      
      setRecommendations(recsData);
      setApplications(appsData);
      
      // Check if user has CV
      const cvData = await import('../services/api').then(api => api.cvService.getCV());
      setHasCV(!!cvData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async () => {
    try {
      const cvData = await import('../services/api').then(api => api.cvService.getCV());
      const pdfBlob = await import('../services/api').then(api => api.cvService.generatePDF(cvData));
      
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mon-cv.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "CV téléchargé",
        description: "Votre CV a été téléchargé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le CV",
        variant: "destructive"
      });
    }
  };

  const handleApply = async (jobId: number, jobTitle: string) => {
    try {
      await jobService.applyToJob(jobId.toString(), {
        cover_letter: `Je suis très intéressé par le poste de ${jobTitle} et je pense que mon profil correspond parfaitement à vos attentes.`
      });
      
      // Update local state
      setRecommendations(prev => prev.map(rec => 
        rec.job_id === jobId ? { ...rec, is_applied: true } : rec
      ));
      
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès",
      });
      
      // Reload applications
      const appsData = await applicationService.getUserApplications();
      setApplications(appsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la candidature",
        variant: "destructive"
      });
    }
  };

  const handleViewJob = async (jobId: number) => {
    try {
      await jobService.markRecommendationAsViewed(jobId.toString());
      setRecommendations(prev => prev.map(rec => 
        rec.job_id === jobId ? { ...rec, is_viewed: true } : rec
      ));
    } catch (error) {
      console.error('Error marking job as viewed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'reviewed': return 'Consultée';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'interview_scheduled': return 'Entretien programmé';
      default: return status;
    }
  };

  if (showCVBuilder) {
    return (
      <CVBuilder 
        onBack={() => setShowCVBuilder(false)}
        onSave={() => {
          setHasCV(true);
          setShowCVBuilder(false);
          toast({
            title: "CV sauvegardé",
            description: "Votre CV a été sauvegardé avec succès",
          });
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">Candidat</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - CV Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Mon CV</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasCV ? (
                  <>
                    <div className="text-center">
                      <div className="bg-green-100 rounded-lg p-4 mb-4">
                        <FileText className="h-12 w-12 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-green-800">CV créé avec succès</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowCVBuilder(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier mon CV
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleDownloadCV}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger PDF
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="bg-gray-100 rounded-lg p-8 mb-4">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Aucun CV créé</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowCVBuilder(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Créer mon CV
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Applications */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Mes candidatures</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Link to="/jobs">
                    <Button className="w-full bg-green-600 hover:bg-green-700 mb-2">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Voir les offres d'emploi
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <div key={app.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{app.job_title}</h4>
                          <Badge className={`${getStatusColor(app.status)} text-xs`}>
                            {getStatusText(app.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{app.company}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{app.applied_date}</p>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">{app.match_score}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Aucune candidature</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Job Recommendations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Recommandations d'emploi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((job) => (
                      <div 
                        key={job.id} 
                        className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                          job.is_applied ? 'bg-green-50 border-green-200' : 
                          job.is_viewed ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{job.type}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{job.salary_range}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-lg">{job.match_score}%</span>
                              </div>
                              <p className="text-xs text-gray-500">Compatibilité</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {job.required_skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.required_skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.required_skills.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleViewJob(job.job_id);
                                navigate(`/jobs/${job.job_id}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                            {!job.is_applied ? (
                              <Button
                                size="sm"
                                onClick={() => handleApply(job.job_id, job.title)}
                              >
                                Postuler
                              </Button>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">
                                Candidature envoyée
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Aucune recommandation disponible</p>
                      <p className="text-sm text-gray-500">Créez votre CV pour recevoir des recommandations personnalisées</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
