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

export interface OptimizationResponse {
  analysisId: string;
  matchScore?: number;
  gapAnalysis?: any;
  rewrites?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
