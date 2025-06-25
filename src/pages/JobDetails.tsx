import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building, MapPin, DollarSign, Clock, Calendar, Star, Briefcase, User, Mail, Phone, FileText, Send, CheckCircle } from "lucide-react";
import { jobService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  type: string;
  required_skills: string[];
  experience_level: string;
  created_at: string;
  user_id: number;
  first_name: string;
  last_name: string;
}

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadJobDetails();
      checkIfSaved();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJob(id!);
      setJob(jobData);
      
      // Check if user has already applied
      if (user?.role === 'candidate') {
        try {
          const applications = await import('../services/api').then(api => api.applicationService.getUserApplications());
          const hasAppliedToThisJob = applications.some((app: any) => app.job_id === parseInt(id!));
          setHasApplied(hasAppliedToThisJob);
        } catch (error) {
          console.error('Error checking application status:', error);
        }
      }
    } catch (error) {
      console.error('Error loading job details:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'offre",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user || user.role !== 'candidate') {
      setIsSaved(false);
      return;
    }
    try {
      const res = await jobService.checkIfJobSaved(id!);
      setIsSaved(!!res.saved);
    } catch (error) {
      setIsSaved(false);
    }
  };

  const handleSaveJob = async () => {
    if (!user || user.role !== 'candidate') {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté en tant que candidat pour sauvegarder l'offre",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      if (!isSaved) {
        await jobService.saveJob(id!);
        setIsSaved(true);
        toast({ title: "Offre sauvegardée" });
      } else {
        await jobService.unsaveJob(id!);
        setIsSaved(false);
        toast({ title: "Offre retirée des sauvegardes" });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible de sauvegarder l'offre",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!user || user.role !== 'candidate') {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté en tant que candidat pour postuler",
        variant: "destructive"
      });
      return;
    }

    try {
      setApplying(true);
      await jobService.applyToJob(id!, {
        cover_letter: coverLetter || `Je suis très intéressé par le poste de ${job?.title} et je pense que mon profil correspond parfaitement à vos attentes.`
      });
      
      setHasApplied(true);
      setShowApplyDialog(false);
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès",
      });
    } catch (error: any) {
      console.error('Error applying to job:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.error || "Impossible d'envoyer la candidature",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'entry': return 'Débutant (0-2 ans)';
      case 'mid': return 'Intermédiaire (2-5 ans)';
      case 'senior': return 'Senior (5-8 ans)';
      case 'lead': return 'Lead (8+ ans)';
      default: return level;
    }
  };

  const getJobTypeText = (type: string) => {
    switch (type) {
      case 'full-time': return 'Temps plein';
      case 'part-time': return 'Temps partiel';
      case 'contract': return 'Contrat';
      case 'internship': return 'Stage';
      default: return type;
    }
  };

  const subject = encodeURIComponent("Découvrez cette offre d'emploi !");
  const body = encodeURIComponent(`Je voulais partager cette offre avec vous : ${window.location.href}`);
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`Découvrez cette offre d'emploi : ${window.location.href}`)}`;

  const teamsLink = `https://teams.microsoft.com/share?href=${encodeURIComponent(window.location.href)}`;

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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre non trouvée</h2>
          <p className="text-gray-600 mb-4">L'offre d'emploi que vous recherchez n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Détails de l'offre</h1>
            </div>
            {user?.role === 'candidate' && (
              <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={hasApplied}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Candidature envoyée
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Postuler
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Postuler à {job.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Lettre de motivation</label>
                      <Textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Décrivez pourquoi vous êtes intéressé par ce poste et pourquoi vous pensez être le bon candidat..."
                        rows={6}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowApplyDialog(false)}
                        disabled={applying}
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleApply}
                        disabled={applying}
                      >
                        {applying ? 'Envoi...' : 'Envoyer candidature'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-2 text-lg text-gray-600 mb-4">
                    <Building className="h-5 w-5" />
                    <span>{job.company}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{getJobTypeText(job.type)}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Publiée le {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Compétences requises</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Niveau d'expérience</h3>
                  <Badge variant="outline">
                    {getExperienceLevelText(job.experience_level)}
                  </Badge>
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
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Prérequis et exigences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recruiter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Recruteur</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {job.first_name} {job.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {user?.role === 'candidate' && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={hasApplied}
                    onClick={() => setShowApplyDialog(true)}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Candidature envoyée
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Postuler maintenant
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={handleSaveJob} disabled={saving}>
                    <FileText className="h-4 w-4 mr-2" />
                    {isSaved ? "Retirer des sauvegardes" : "Sauvegarder l'offre"}
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={() => setShowShareDialog(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </CardContent>
              </Card>
            )}

            
          </div>
        </div>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager cette offre</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Button asChild>
              <a href={mailtoLink} target="_blank" rel="noopener noreferrer">Partager par Email</a>
            </Button>
            <Button asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">Partager sur WhatsApp</a>
            </Button>
            <Button asChild>
              <a href={teamsLink} target="_blank" rel="noopener noreferrer">Partager sur Teams</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetails; 