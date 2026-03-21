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

export interface RecruiterHeatmapSection {
  section: string;
  attentionScore: number;
  rationale: string;
}

export interface RecruiterView {
  sixSecondHighlights: string[];
  firstImpressionScore: number;
  attentionHeatmap: RecruiterHeatmapSection[];
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

export interface CreditUsage {
  plan: 'free' | 'pro';
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
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
  recruiterView?: RecruiterView;
  githubAnalyzer?: GithubAnalyzerResult;
  creditUsage?: CreditUsage;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}