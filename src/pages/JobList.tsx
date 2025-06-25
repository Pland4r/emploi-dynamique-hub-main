import { useEffect, useState } from 'react';
import { jobService } from '../services/api';
import { Button } from '../components/ui/button';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const data = await jobService.getAllJobs();
      setJobs(data);
    };
    fetchJobs();
  }, []);

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      await jobService.applyToJob(selectedJob.id, { coverLetter });
      alert('Candidature envoyée !');
      setShowModal(false);
      setCoverLetter('');
    } catch (e) {
      alert('Erreur lors de la candidature');
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Offres d'emploi</h1>
      <div className="grid gap-4">
        {jobs.map(job => (
          <div key={job.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.company} - {job.location}</p>
            <p>{job.description}</p>
            <Button onClick={() => handleApply(job)} className="mt-2">Postuler</Button>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Postuler à {selectedJob.title}</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={5}
              placeholder="Lettre de motivation"
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowModal(false)} variant="secondary">Annuler</Button>
              <Button onClick={submitApplication} disabled={loading}>{loading ? 'Envoi...' : 'Envoyer'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList; 