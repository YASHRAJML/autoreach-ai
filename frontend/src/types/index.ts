export interface CandidateProfile {
  id?: string;
  name: string;
  currentRole: string;
  department: string;
  experience: number;
  skills: string[];
  keyAchievements: string[];
  interests?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  careerGoals?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobDetails {
  id?: string;
  title: string;
  department: string;
  hiringManager?: string;
  recruiter?: string;
  location?: string;
  description: string;
  requirements: string;
  keySkills?: string[];
  benefits?: string[];
  seniority?: string;
  remoteOption?: boolean;
  postedDate?: string;
  applicationDeadline?: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  generatedAt: string;
  emailType: EmailType;
  tone: EmailTone;
}

export type EmailType = 'hiring_manager' | 'recruiter' | 'team_member';
export type EmailTone = 'professional' | 'friendly' | 'formal' | 'casual';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  useCase: string;
}

export interface MatchAnalysis {
  overallScore: number;
  rating: string;
  factors: MatchFactor[];
  recommendations: Recommendation[];
}

export interface MatchFactor {
  factor: string;
  score: number;
  maxScore: number;
  details: string;
  matchingItems?: string[];
}

export interface Recommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  action: string;
}

export interface ProfileAnalysis {
  completenessPercentage: number;
  score: number;
  maxScore: number;
  missing: string[];
  suggestions: string[];
  status: 'excellent' | 'good' | 'fair' | 'needs_improvement';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SkillSuggestion {
  programming: string[];
  frontend: string[];
  backend: string[];
  cloud: string[];
  database: string[];
  tools: string[];
}

export interface AchievementTemplate {
  category: string;
  examples: string[];
} 