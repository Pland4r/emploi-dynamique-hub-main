import { useEffect, useState } from "react";
import { applicationService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ApplicationsHistory = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationService.getUserApplications();
        setApplications(res);
      } catch (error) {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Historique des candidatures</h1>
      {applications.length === 0 ? (
        <div className="text-gray-600">Aucune candidature envoyée.</div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{app.job_title}</div>
                <div className="text-gray-600">{app.company}</div>
                <div className="text-xs text-gray-500">Statut: {app.status} | Score: {app.match_score}%</div>
              </div>
              <Button onClick={() => navigate(`/jobs/${app.job_id}`)}>Voir</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsHistory; 