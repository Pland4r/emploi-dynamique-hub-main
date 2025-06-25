import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Eye, Users, Briefcase, TrendingUp, Star, Calendar, MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import JobPostingForm from "./JobPostingForm";
import { useToast } from "@/hooks/use-toast";
import { jobService } from "@/services/api";

interface Props {
  onBack: () => void;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  type: string;
  status: string;
  created_at: string;
  applications_count: number;
  matched_profiles: number;
}

interface Application {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  match_score: number;
  cover_letter: string;
  applied_date: string;
  skills: string[];
  experience: any[];
  education: any[];
  recruiter_notes?: string;
  interview_date?: string;
}

const RecruiterDashboard = ({ onBack }: Props) => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplications, setShowApplications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsData, recruiterApps] = await Promise.all([
        jobService.getAllJobs(),
        jobService.getRecruiterApplications()
      ]);
      setJobs(jobsData);
      setApplications(recruiterApps);
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

  const handleViewApplications = async (job: Job) => {
    try {
      setSelectedJob(job);
      const applicationsData = await jobService.getJobApplications(job.id.toString());
      setApplications(applicationsData);
      setShowApplications(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidatures",
        variant: "destructive"
      });
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: number, status: string, notes?: string, interviewDate?: string) => {
    try {
      await jobService.updateApplicationStatus(applicationId.toString(), {
        status,
        recruiter_notes: notes,
        interview_date: interviewDate
      });

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status, recruiter_notes: notes, interview_date: interviewDate }
          : app
      ));

      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été mis à jour avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'interview_scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (showJobForm) {
    return (
      <JobPostingForm 
        onBack={() => setShowJobForm(false)}
        onSave={() => {
          setShowJobForm(false);
          loadDashboardData();
          toast({
            title: "Offre publiée",
            description: "Votre offre d'emploi a été publiée avec succès",
          });
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord recruteur</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowJobForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle offre
              </Button>
              <Badge className="bg-green-100 text-green-800">Recruteur</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offres actives</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.filter(job => job.status === 'active').length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total candidatures</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.reduce((total, job) => total + (job.applications_count || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entretiens programmés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'interview_scheduled').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Embauches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter(app => app.status === 'accepted').length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Modal */}
        {showApplications && selectedJob && (
          <Dialog open={showApplications} onOpenChange={setShowApplications}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Candidatures - {selectedJob.title}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <Card key={app.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {app.first_name} {app.last_name}
                              </h3>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-green-600">{app.match_score}%</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-4 w-4" />
                                <span>{app.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Candidature du {new Date(app.applied_date).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {app.skills && app.skills.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-1">Compétences :</p>
                                <div className="flex flex-wrap gap-1">
                                  {app.skills.slice(0, 5).map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {app.skills.length > 5 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{app.skills.length - 5}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {app.cover_letter && (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-1">Lettre de motivation :</p>
                                <p className="text-sm text-gray-600 line-clamp-3">{app.cover_letter}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={`${getStatusColor(app.status)} flex items-center space-x-1`}>
                              {getStatusIcon(app.status)}
                              <span>{getStatusText(app.status)}</span>
                            </Badge>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Voir CV
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>CV de {app.first_name} {app.last_name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {/* CV Preview */}
                                  <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">Expérience</h3>
                                    {app.experience && app.experience.length > 0 ? (
                                      app.experience.map((exp, index) => (
                                        <div key={index} className="mb-2 text-sm">
                                          <p className="font-medium">{exp.position} chez {exp.company}</p>
                                          <p className="text-gray-600">{exp.start_date} - {exp.current ? 'Présent' : exp.end_date}</p>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-gray-500 text-sm">Aucune expérience renseignée</p>
                                    )}
                                  </div>
                                  
                                  <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-2">Formation</h3>
                                    {app.education && app.education.length > 0 ? (
                                      app.education.map((edu, index) => (
                                        <div key={index} className="mb-2 text-sm">
                                          <p className="font-medium">{edu.degree} en {edu.field}</p>
                                          <p className="text-gray-600">{edu.institution}</p>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-gray-500 text-sm">Aucune formation renseignée</p>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex space-x-2">
                            <Select
                              value={app.status}
                              onValueChange={(value) => handleUpdateApplicationStatus(app.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="reviewed">Consultée</SelectItem>
                                <SelectItem value="interview_scheduled">Entretien programmé</SelectItem>
                                <SelectItem value="accepted">Acceptée</SelectItem>
                                <SelectItem value="rejected">Refusée</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-1" />
                                Programmer entretien
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Programmer un entretien</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Date et heure</label>
                                  <input
                                    type="datetime-local"
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleUpdateApplicationStatus(
                                          app.id, 
                                          'interview_scheduled', 
                                          app.recruiter_notes,
                                          e.target.value
                                        );
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Notes</label>
                                  <Textarea
                                    placeholder="Notes pour l'entretien..."
                                    value={app.recruiter_notes || ''}
                                    onChange={(e) => {
                                      handleUpdateApplicationStatus(
                                        app.id, 
                                        app.status, 
                                        e.target.value,
                                        app.interview_date
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Aucune candidature pour cette offre</p>
                    <p className="text-sm text-gray-500">Les candidatures apparaîtront ici</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* My Job Postings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Mes offres d'emploi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        <p className="text-sm text-gray-500">
                          Publiée le {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status === 'active' ? 'Actif' : 'Fermé'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-blue-600">{job.salary_range}</span>
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{job.applications_count || 0} candidatures</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4" />
                          <span>{job.matched_profiles || 0} profils compatibles</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplications(job)}
                        disabled={!job.applications_count}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir candidatures
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Aucune offre d'emploi créée</p>
                  <p className="text-sm text-gray-500">Créez votre première offre pour commencer</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
