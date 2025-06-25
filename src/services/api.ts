import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    userType: 'candidate' | 'recruiter';
    companyInfo?: {
      companyName: string;
      jobTitle: string;
    };
  }) => {
    try {
      console.log('Sending registration request with data:', userData);
      const response = await api.post('/users/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
};

// Job services
export const jobService = {
  getAllJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: any) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: any) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  applyToJob: async (jobId: string, applicationData: any) => {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },

  getJobApplications: async (jobId: string) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  updateApplicationStatus: async (applicationId: string, statusData: any) => {
    const response = await api.put(`/jobs/applications/${applicationId}`, statusData);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/jobs/recommendations');
    return response.data;
  },

  markRecommendationAsViewed: async (jobId: string) => {
    const response = await api.put(`/jobs/recommendations/${jobId}/view`);
    return response.data;
  },

  getRecruiterApplications: async () => {
    const res = await api.get('/jobs/recruiter/applications');
    return res.data;
  },

  saveJob: async (jobId: string) => {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data;
  },

  unsaveJob: async (jobId: string) => {
    const response = await api.delete(`/jobs/${jobId}/save`);
    return response.data;
  },

  checkIfJobSaved: async (jobId: string) => {
    const response = await api.get(`/jobs/${jobId}/save`);
    return response.data;
  },

  getSavedJobs: async () => {
    const response = await api.get('/jobs/saved');
    return response.data;
  },
};

// CV services
export const cvService = {
  saveCV: async (cvData: any) => {
    const response = await api.post('/cv', cvData);
    return response.data;
  },

  getCV: async () => {
    const response = await api.get('/cv');
    return response.data;
  },

  updateCV: async (cvData: any) => {
    const response = await api.put('/cv', cvData);
    return response.data;
  },

  generatePDF: async (cvData: any) => {
    const response = await api.post('/cv/generate-pdf', cvData, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Application services
export const applicationService = {
  getUserApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  getApplication: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },
};

export default api; 