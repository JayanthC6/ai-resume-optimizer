export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  subscription: 'free' | 'pro';
  creditsRemaining?: number;
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

export interface StructuredResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: {
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
}

export interface ResumeRegenerationResponse {
  regeneratedResume: StructuredResume | string;
  updatedResume?: StructuredResume | string;
  highlights?: string[];
  changeLog?: {
    original: string;
    updated: string;
    reason: string;
  }[];
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

export interface RoadmapPhase {
  timeframe: '30_days' | '60_days' | '90_days';
  goals: string[];
  learningResources: string[];
  miniProjects: string[];
}

export interface SkillGapRoadmap {
  missingSkills: string[];
  phases: RoadmapPhase[];
}

export interface InterviewQuestion {
  question: string;
  whyAsked: string;
  sampleAnswer: string;
}

export interface InterviewQuestionSet {
  technical: InterviewQuestion[];
  behavioral: InterviewQuestion[];
  starAnswers: {
    situation: string;
    task: string;
    action: string;
    result: string;
  }[];
}

export interface GithubBulletSuggestion {
  original: string;
  improved: string;
  quantifiedContribution: string;
  techStackFraming: string;
}

export interface GithubAnalyzerResult {
  profile: string;
  achievements: string[];
  bulletSuggestions: GithubBulletSuggestion[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  atsSafe: boolean;
  tone: 'classic' | 'modern' | 'compact';
}

export interface TeamAnalytics {
  teamName: string;
  members: number;
  avgMatchScore: number;
  avgAtsScore: number;
  highPerformers: number;
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
  skillGapRoadmap?: SkillGapRoadmap;
  interviewQuestionSet?: InterviewQuestionSet;
  githubAnalyzer?: GithubAnalyzerResult;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}