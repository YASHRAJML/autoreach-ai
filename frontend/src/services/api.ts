import axios from 'axios';
import {
  CandidateProfile,
  JobDetails,
  GeneratedEmail,
  EmailType,
  EmailTone,
  MatchAnalysis,
  ProfileAnalysis,
  EmailTemplate,
  SkillSuggestion,
  AchievementTemplate
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Email API
export const emailApi = {
  async generateEmail(
    candidateProfile: CandidateProfile,
    jobDetails: JobDetails,
    emailType: EmailType = 'hiring_manager',
    tone: EmailTone = 'professional'
  ): Promise<GeneratedEmail> {
    const response = await api.post('/email/generate', {
      candidateProfile,
      jobDetails,
      emailType,
      tone,
    });
    return response.data.email;
  },

  async getTemplates(): Promise<EmailTemplate[]> {
    const response = await api.get('/email/templates');
    return response.data.templates;
  },

  async analyzeEmail(emailContent: string): Promise<any> {
    const response = await api.post('/email/analyze', {
      emailContent,
    });
    return response.data.analysis;
  },
};

// Candidate API
export const candidateApi = {
  async getProfile(id?: string): Promise<CandidateProfile> {
    const url = id ? `/candidate/profile/${id}` : '/candidate/profile';
    const response = await api.get(url);
    return response.data.profile;
  },

  async saveProfile(profile: CandidateProfile): Promise<CandidateProfile> {
    const response = await api.post('/candidate/profile', profile);
    return response.data.profile;
  },

  async getSkillSuggestions(query?: string): Promise<SkillSuggestion | string[]> {
    const params = query ? { query } : {};
    const response = await api.get('/candidate/skills/suggestions', { params });
    return response.data.suggestions;
  },

  async getAchievementTemplates(): Promise<AchievementTemplate[]> {
    const response = await api.get('/candidate/achievements/templates');
    return response.data.templates;
  },

  async analyzeProfile(profile: CandidateProfile): Promise<ProfileAnalysis> {
    const response = await api.post('/candidate/profile/analyze', { profile });
    return response.data.analysis;
  },
};

// Jobs API
export const jobsApi = {
  async getJobs(limit?: number): Promise<JobDetails[]> {
    const params = typeof limit === 'number' ? { limit } : {};
    const response = await api.get('/jobs/list', { params });
    return response.data.jobs;
  },
  async analyzeJobPosting(jobText: string): Promise<JobDetails> {
    const response = await api.post('/jobs/analyze', { jobText });
    return response.data.jobData;
  },

  async getSampleJob(): Promise<JobDetails> {
    const response = await api.get('/jobs/sample');
    return response.data.job;
  },

  async getMatchAnalysis(
    candidateProfile: CandidateProfile,
    jobData: JobDetails
  ): Promise<MatchAnalysis> {
    const response = await api.post('/jobs/match', {
      candidateProfile,
      jobData,
    });
    return response.data.matchAnalysis;
  },

  async getDepartments(): Promise<string[]> {
    const response = await api.get('/jobs/departments');
    return response.data.departments;
  },
};

// Health check
export const healthApi = {
  async checkHealth(): Promise<{ status: string; message: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 