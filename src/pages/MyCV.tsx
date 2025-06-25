import { useEffect, useState } from "react";
import { cvService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Globe2 } from "lucide-react";
import ModernCV from "../components/ModernCV";
import ClassicCV from "../components/ClassicCV";
import MinimalCV from "../components/MinimalCV";
import CreativeCV from "../components/CreativeCV";

const MyCV = () => {
  const [cv, setCV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const res = await cvService.getCV();
        setCV(res);
      } catch (error) {
        setCV(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCV();
  }, []);

  const handleEdit = () => {
    navigate("/edit-cv");
  };

  const handleDownload = async () => {
    if (!cv) return;
    const pdfBlob = await cvService.generatePDF({
      personalInfo: cv.personalInfo,
      experience: cv.experiences,
      education: cv.education,
      skills: cv.skills,
      languages: cv.languages,
      certifications: cv.certifications,
      template: cv.template || 'modern',
    });
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mon-cv.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  if (!cv) return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mon CV</h1>
      <div className="text-gray-600 mb-4">Aucun CV trouvé.</div>
      <Button onClick={handleEdit}>Créer mon CV</Button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-8 print:bg-white print:text-black">
      <div className="bg-white shadow-lg rounded-lg p-8 border print:shadow-none print:border-none">
        {/* Template Preview */}
        {(() => {
          const props = {
            personalInfo: cv.personalInfo,
            experiences: cv.experiences,
            education: cv.education,
            skills: cv.skills,
            languages: cv.languages,
            certifications: cv.certifications,
          };
          switch (cv.template) {
            case 'creative':
              return <CreativeCV {...props} />;
            case 'classic':
              return <ClassicCV {...props} />;
            case 'minimal':
              return <MinimalCV {...props} />;
            case 'modern':
            default:
              return <ModernCV {...props} />;
          }
        })()}
        {/* Actions */}
        <div className="flex gap-2 mt-8 print:hidden">
          <Button onClick={handleEdit}>Éditer</Button>
          <Button onClick={handleDownload}>Télécharger PDF</Button>
        </div>
      </div>
    </div>
  );
};

export default MyCV; 