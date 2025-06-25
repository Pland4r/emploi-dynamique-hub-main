import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Target, TrendingUp, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CandidateDashboard from "@/components/CandidateDashboard";
import RecruiterDashboard from "@/components/RecruiterDashboard";

const Index = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'candidate' | 'recruiter' | null>(null);

  const handleLogout = () => {
    logout();
    setUserType(null);
  };

  // Si l'utilisateur est connecté et sélectionne un type, afficher le dashboard
  if (isAuthenticated && userType === 'candidate') {
    return <CandidateDashboard onBack={() => setUserType(null)} />;
  }

  if (isAuthenticated && userType === 'recruiter') {
    return <RecruiterDashboard onBack={() => setUserType(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TalentConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600">Bonjour, {user?.name}</span>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-blue-600"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-blue-600"
                    onClick={() => navigate('/login')}
                  >
                    Connexion
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/register')}
                  >
                    S'inscrire
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!isAuthenticated ? (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Connectez talents et opportunités
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              La plateforme qui révolutionne le recrutement avec un matching intelligent 
              entre candidats et recruteurs
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/register')}
              >
                Commencer gratuitement
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue, {user?.name} !
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez votre tableau de bord pour commencer
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">10K+</h3>
            <p className="text-gray-600">Candidats actifs</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">5K+</h3>
            <p className="text-gray-600">Offres d'emploi</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">95%</h3>
            <p className="text-gray-600">Taux de matching</p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2K+</h3>
            <p className="text-gray-600">Recrutements réussis</p>
          </div>
        </div>

        {/* User Type Selection or Dashboard Access */}
        {isAuthenticated ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500">
              <CardHeader className="text-center">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Espace Candidat</CardTitle>
                <CardDescription className="text-lg">
                  Accédez à votre tableau de bord candidat
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate('/candidate-dashboard')}
                >
                  Accéder au tableau de bord
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-green-500">
              <CardHeader className="text-center">
                <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Espace Recruteur</CardTitle>
                <CardDescription className="text-lg">
                  Accédez à votre tableau de bord recruteur
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => navigate('/recruiter-dashboard')}
                >
                  Accéder au tableau de bord
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-500">
              <CardHeader className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Je suis candidat</CardTitle>
                <CardDescription className="text-lg">
                  Créez votre CV, découvrez des opportunités et postulez aux offres qui vous correspondent
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left text-gray-600 mb-6 space-y-2">
                  <li>• Créer et modifier votre CV en ligne</li>
                  <li>• Recevoir des recommandations personnalisées</li>
                  <li>• Voir votre score de compatibilité</li>
                  <li>• Postuler directement aux offres</li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setUserType('candidate')}
                >
                  Accéder au tableau de bord candidat
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-green-500">
              <CardHeader className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Je suis recruteur</CardTitle>
                <CardDescription className="text-lg">
                  Publiez vos offres, consultez les candidatures et trouvez les meilleurs profils
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left text-gray-600 mb-6 space-y-2">
                  <li>• Créer et gérer vos offres d'emploi</li>
                  <li>• Consulter les candidatures reçues</li>
                  <li>• Voir les profils classés par compatibilité</li>
                  <li>• Accéder aux meilleurs talents</li>
                </ul>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setUserType('recruiter')}
                >
                  Accéder au tableau de bord recruteur
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2024 TalentConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
