export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  subscription: 'free' | 'pro';
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface UploadResumeResponse {
  resumeId: string;
  status: 'processing' | 'completed' | 'failed';
}

export interface OptimizationRequest {
  resumeId: string;
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
}

export interface ResumeRegenerationRequest {
  resumeId: string;
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
}

export interface ResumeRegenerationResponse {
  regeneratedResume: string;
  highlights?: string[];
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  suggestedAdditions: string[];
}

export interface GapAnalysis {
  missingSkills: string[];
  strengths: string[];
  keywordAnalysis?: KeywordAnalysis;
}

export interface RewriteSuggestions {
  summary: string;
  experienceText: string;
  actionVerbUpgrades?: string[];
  measurableImpactSuggestions?: string[];
  toolTechAdditions?: string[];
  weakAdjectivesToRemove?: string[];
}

export interface OptimizationResponse {
  analysisId: string;
  id?: string;
  resumeId?: string;
  matchScore?: number;
  atsScore?: number;
  keywordAnalysis?: KeywordAnalysis;
  gapAnalysis?: GapAnalysis;
  rewrites?: RewriteSuggestions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}