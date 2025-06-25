import { useEffect, useState } from "react";
import { jobService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SavedJobs = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        // You need to implement a backend endpoint to get all saved jobs for the user
        const res = await jobService.getSavedJobs();
        setJobs(res);
      } catch (error) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Offres sauvegardées</h1>
      {jobs.length === 0 ? (
        <div className="text-gray-600">Aucune offre sauvegardée.</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{job.title}</div>
                <div className="text-gray-600">{job.company} - {job.location}</div>
              </div>
              <Button onClick={() => navigate(`/jobs/${job.id}`)}>Voir</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs; 