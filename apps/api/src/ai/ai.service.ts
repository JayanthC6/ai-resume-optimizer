import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  GithubAnalyzerResult,
  InterviewQuestionSet,
  SkillGapRoadmap,
} from '@repo/types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor() {}

  private getJsonModel(modelName: string) {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      throw new Error(
        'Missing GOOGLE_API_KEY. Please set it in your environment.',
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });
  }

  private getModelCandidates() {
    const primary = process.env.GOOGLE_GEMINI_MODEL;
    if (!primary) {
      throw new Error(
        'Missing GOOGLE_GEMINI_MODEL. Set it to a valid Gemini model name returned by the ListModels API.',
      );
    }

    const fallbackRaw =
      process.env.GOOGLE_GEMINI_FALLBACK_MODELS ||
      'models/gemini-2.0-flash,models/gemini-1.5-flash';
    const fallbacks = fallbackRaw
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    return [primary, ...fallbacks].filter(
      (model, idx, arr) => arr.indexOf(model) === idx,
    );
  }

  private async generateJson(prompt: string) {
    const maxAttempts = 4;
    const models = this.getModelCandidates();
    let lastError: unknown;

    for (const modelName of models) {
      const model = this.getJsonModel(modelName);

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const result = await model.generateContent(prompt);
          if (modelName !== models[0]) {
            this.logger.warn(`AI call succeeded using fallback model: ${modelName}`);
          }
          return JSON.parse(result.response.text());
        } catch (error: any) {
          lastError = error;
          const message = String(error?.message || error || 'Unknown AI error');

          if (this.isPermanentQuotaExhaustion(message)) {
            throw new Error(
              'Gemini API quota exhausted for this key. Please use a different GOOGLE_API_KEY or wait for quota reset.',
            );
          }

          const transient = this.isTransientAiError(message);
          const isLastAttempt = attempt === maxAttempts;

          if (!transient) {
            throw error;
          }

          if (isLastAttempt) {
            this.logger.warn(
              `AI model ${modelName} exhausted retries (${maxAttempts}/${maxAttempts}).`,
            );
            break;
          }

          const computedDelayMs = 700 * attempt + Math.floor(Math.random() * 250);
          const suggestedDelayMs = this.extractRetryDelayMs(message);
          const delayMs = Math.min(20000, Math.max(computedDelayMs, suggestedDelayMs));
          this.logger.warn(
            `AI call transient failure on ${modelName} (attempt ${attempt}/${maxAttempts}): ${message}. Retrying in ${delayMs}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error('AI request failed after retries and model fallbacks');
  }

  private isTransientAiError(message: string) {
    const normalized = message.toLowerCase();
    return (
      normalized.includes('503') ||
      normalized.includes('service unavailable') ||
      normalized.includes('429') ||
      normalized.includes('resource_exhausted') ||
      normalized.includes('quota') ||
      normalized.includes('timeout')
    );
  }

  private isPermanentQuotaExhaustion(message: string) {
    const normalized = message.toLowerCase();
    return (
      (normalized.includes('quota exceeded') &&
        (normalized.includes('perday') || normalized.includes('limit: 0'))) ||
      normalized.includes('resource_exhausted') ||
      normalized.includes('429')
    );
  }

  private extractRetryDelayMs(message: string) {
    const lower = message.toLowerCase();

    const retryInMatch = lower.match(/retry in\s+([0-9]+(?:\.[0-9]+)?)s/);
    if (retryInMatch?.[1]) {
      return Math.round(Number(retryInMatch[1]) * 1000);
    }

    const retryDelayMatch = lower.match(/"retrydelay"\s*:\s*"([0-9]+)s"/);
    if (retryDelayMatch?.[1]) {
      return Number(retryDelayMatch[1]) * 1000;
    }

    return 0;
  }

  async optimizeResume(rawText: string, jobDescription: string) {
    try {
      const prompt = `
        You are an expert ATS resume optimizer.
        Analyze the following resume against the provided job description.
        Output MUST be valid JSON matching this schema:
        {
          "matchScore": number (0-100),
          "atsScore": number (0-100),
          "keywordAnalysis": {
            "matched": string[],
            "missing": string[],
            "suggestedAdditions": string[]
          },
          "gapAnalysis": {
            "missingSkills": string[],
            "strengths": string[],
            "keywordAnalysis": {
              "matched": string[],
              "missing": string[],
              "suggestedAdditions": string[]
            }
          },
          "rewrites": {
            "summary": string,
            "experienceText": string,
            "actionVerbUpgrades": string[],
            "measurableImpactSuggestions": string[],
            "toolTechAdditions": string[],
            "weakAdjectivesToRemove": string[]
          }
        }
        
        Resume: ${rawText}
        Job Description: ${jobDescription}
      `;

      return await this.generateJson(prompt);
    } catch (error: any) {
      const message = String(error?.message || error || 'Unknown AI error');
      this.logger.error('Optimization failed', message);
      throw new Error(`AI processing failed: ${message}`);
    }
  }

  async regenerateResume(
    rawText: string,
    jobTitle: string,
    jobDescription: string,
    companyName?: string,
  ) {
    try {
      const prompt = `
You are an expert resume writer and ATS optimization specialist.
You will EDIT the candidate's existing resume text.
Return the same resume content, improved for the target role.

CRITICAL RULES:
- Preserve ALL factual information from the original resume. Do not drop any data.
- Preserve EVERY link, profile URL, and website from the original resume. This includes LinkedIn, GitHub, LeetCode, HackerRank, portfolio, personal website, Kaggle, CodeChef, blog URLs, and any other profile links. If a link exists in the original resume, it MUST appear in personalInfo fields (linkedin, github, portfolio) or in the "additionalLinks" array.
- Do not invent employers, dates, degrees, or certifications.
- Keep existing section flow and overall structure from the original resume.
- Keep original achievements, and only rewrite wording to improve clarity/impact.
- Improve ATS keyword alignment to the job description.
- Use concise, strong bullet points and measurable outcomes where possible.
- If some original text is weak, rewrite it instead of deleting major information.
- Keep the resume content CONCISE. Aim for a single-page resume:
  - Professional summary should be 2-3 lines maximum.
  - Each experience entry should have 2-3 bullet points maximum, not more.
  - Each project description should be 1-2 sentences.
  - Combine related skills into broader categories (max 4-5 skill categories).
  - Keep bullet points short (1 line each, under 120 characters ideally).

Output MUST be valid JSON using this schema exactly:
{
  "updatedResume": {
    "personalInfo": {
      "name": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string", "github": "string", "portfolio": "string",
      "additionalLinks": [{ "label": "string (e.g. LeetCode, HackerRank, Kaggle)", "url": "string" }]
    },
    "summary": "string",
    "experience": [
      { "company": "string", "title": "string", "location": "string", "startDate": "string", "endDate": "string", "bullets": ["string"] }
    ],
    "education": [
      { "institution": "string", "degree": "string", "location": "string", "startDate": "string", "endDate": "string", "gpa": "string" }
    ],
    "skills": [
      { "category": "string", "items": ["string"] }
    ],
    "projects": [
      { "name": "string", "description": "string", "technologies": ["string"], "link": "string" }
    ]
  },
  "highlights": ["string"],
  "changeLog": [
    {
      "original": "string",
      "updated": "string",
      "reason": "string"
    }
  ]
}

The updatedResume must contain the full, improved CV content structured into the categories above. Do not omit any sections, links, or profile URLs from the original resume. If there are links like LeetCode, HackerRank etc. that don't fit in linkedin/github/portfolio, put them in additionalLinks.

Target Role: ${jobTitle}
Company: ${companyName || 'Not specified'}
Job Description: ${jobDescription}

Original Resume:
${rawText}
`;

      const aiResult = await this.generateJson(prompt);
      const updatedResume = aiResult?.updatedResume || aiResult?.regeneratedResume || '';

      return {
        regeneratedResume: updatedResume,
        updatedResume,
        highlights: Array.isArray(aiResult?.highlights) ? aiResult.highlights : [],
        changeLog: Array.isArray(aiResult?.changeLog) ? aiResult.changeLog : [],
      };
    } catch (error: any) {
      this.logger.error('Resume regeneration failed', error?.message || error);
      throw new Error('AI resume regeneration failed');
    }
  }

  async generateSkillGapRoadmap(
    rawText: string,
    jobTitle: string,
    jobDescription: string,
  ): Promise<SkillGapRoadmap> {
    try {
      const prompt = `
You are a career coach and technical mentor.
Generate a practical 30/60/90-day upskilling roadmap for this candidate.

Output MUST be valid JSON using this schema exactly:
{
  "missingSkills": string[],
  "phases": [
    {
      "timeframe": "30_days" | "60_days" | "90_days",
      "goals": string[],
      "learningResources": string[],
      "miniProjects": string[]
    }
  ]
}

Role: ${jobTitle}
Job Description: ${jobDescription}
Resume: ${rawText}
`;

      return await this.generateJson(prompt);
    } catch (error: any) {
      this.logger.error('Roadmap generation failed', error?.message || error);
      throw new Error('AI roadmap generation failed');
    }
  }

  async generateInterviewQuestions(
    rawText: string,
    jobTitle: string,
    jobDescription: string,
  ): Promise<InterviewQuestionSet> {
    try {
      const prompt = `
You are a senior technical interviewer.
Generate likely interview questions and STAR-style answer guidance for this candidate.

Output MUST be valid JSON using this schema exactly:
{
  "technical": [{ "question": string, "whyAsked": string, "sampleAnswer": string }],
  "behavioral": [{ "question": string, "whyAsked": string, "sampleAnswer": string }],
  "starAnswers": [{ "situation": string, "task": string, "action": string, "result": string }]
}

Role: ${jobTitle}
Job Description: ${jobDescription}
Resume: ${rawText}
`;

      return await this.generateJson(prompt);
    } catch (error: any) {
      this.logger.error('Interview generation failed', error?.message || error);
      throw new Error('AI interview generation failed');
    }
  }

  async analyzeGithubPortfolio(
    rawText: string,
    jobTitle: string,
    jobDescription: string,
    githubContext: string,
  ): Promise<GithubAnalyzerResult> {
    try {
      const prompt = `
You are a hiring manager optimizing resume project bullets.
Use candidate resume context and GitHub account context to suggest stronger achievements.

Output MUST be valid JSON using this schema exactly:
{
  "profile": string,
  "achievements": string[],
  "bulletSuggestions": [
    {
      "original": string,
      "improved": string,
      "quantifiedContribution": string,
      "techStackFraming": string
    }
  ]
}

Role: ${jobTitle}
Job Description: ${jobDescription}
Resume: ${rawText}
GitHub Account Context: ${githubContext}
`;

      return await this.generateJson(prompt);
    } catch (error: any) {
      this.logger.error(
        'GitHub analyzer generation failed',
        error?.message || error,
      );
      throw new Error('AI github analyzer generation failed');
    }
  }

  async generateInterviewResponse(
    history: { role: string; content: string }[],
    resumeText: string,
    jobDescription: string,
    role: string,
    mode: string,
    language?: string,
  ) {
    try {
      const systemPrompt = `
You are a Senior Hiring Manager conducting a mock interview for the position of ${role}.
Target Mode: ${mode}
${language ? `Preferred Coding Language: ${language}` : ''}

CONTEXT:
JD: ${jobDescription}
Resume: ${resumeText}

INTERVIEW PROTOCOL:
1. Start with behavioral questions, then move to technical.
2. Ask exactly ONE question at a time.
3. Scalability: Scale complexity based on previous answers.
4. Adaptive Probing: If an answer is weak or wrong, ask a follow-up to probe their understanding instead of giving the answer.
5. In Technical mode/Mixed mode: You MUST include at least one Multiple Choice Question (MCQ) and one coding-related query during the session.

Output MUST be valid JSON:
{
  "question": "string (the actual question or follow-up)"
}

CHAT HISTORY:
${JSON.stringify(history)}
`;

      const result = await this.generateJson(systemPrompt);
      return result.question;
    } catch (error: any) {
      this.logger.error('Interview chat failed', error?.message || error);
      throw new Error('AI interview response failed');
    }
  }

  async evaluateInterview(
    history: { role: string; content: string }[],
    resumeText: string,
    jobDescription: string,
    role: string,
  ) {
    try {
      const prompt = `
You are a Senior Hiring Manager evaluating a completed mock interview.
Analyze the following transcript against the JD and Resume.

JD: ${jobDescription}
Resume: ${resumeText}

TRANSCRIPT:
${JSON.stringify(history)}

Output MUST be valid JSON matching this schema exactly:
{
  "overall_score": number (0-100),
  "technical_score": number (0-100),
  "communication_score": number (0-100),
  "core_strengths": string[],
  "areas_for_improvement": string[]
}
`;

      return await this.generateJson(prompt);
    } catch (error: any) {
      this.logger.error('Interview evaluation failed', error?.message || error);
      throw new Error('AI interview evaluation failed');
    }
  }

  async recommendInterviewDuration(
    resumeText: string,
    jobDescription: string,
    role: string,
    mode: string,
  ) {
    try {
      const prompt = `
You are an interview prep coach.
Recommend the ideal mock interview duration for this user so they can reach around 85-90% readiness for a real face-to-face interview.

Inputs:
- Role: ${role}
- Interview mode: ${mode}
- JD: ${jobDescription}
- Resume: ${resumeText}

Output MUST be valid JSON exactly:
{
  "recommended_minutes": number,
  "rationale": string,
  "confidence": "low" | "medium" | "high"
}

Constraints:
- recommended_minutes must be between 15 and 90
- rationale must be short and actionable (max 2 sentences)
`;

      const result = await this.generateJson(prompt);
      const minutes = Math.max(
        15,
        Math.min(90, Number(result?.recommended_minutes) || 30),
      );

      return {
        recommended_minutes: minutes,
        rationale:
          typeof result?.rationale === 'string'
            ? result.rationale
            : 'Based on your JD and resume depth, this duration balances coverage and realism.',
        confidence:
          result?.confidence === 'low' ||
          result?.confidence === 'medium' ||
          result?.confidence === 'high'
            ? result.confidence
            : 'medium',
      };
    } catch (error: any) {
      this.logger.error(
        'Interview duration recommendation failed',
        error?.message || error,
      );
      return {
        recommended_minutes: mode === 'Technical' ? 45 : mode === 'Mixed' ? 50 : 30,
        rationale:
          'This default duration gives enough time to cover behavioral and technical depth for interview readiness.',
        confidence: 'medium',
      };
    }
  }

  async generateCodingPracticeQuestions(
    resumeText: string,
    jobDescription: string,
    role: string,
    language: string,
  ) {
    try {
      const prompt = `
You are a senior interviewer preparing coding practice for a candidate.
Generate 3 coding questions likely to be asked for this role and JD.

Role: ${role}
Language: ${language}
JD: ${jobDescription}
Resume: ${resumeText}

Output MUST be valid JSON exactly:
{
  "questions": [
    {
      "title": string,
      "difficulty": "easy" | "medium" | "hard",
      "prompt": string,
      "expected_topics": string[]
    }
  ]
}
`;

      const result = await this.generateJson(prompt);
      const questions = Array.isArray(result?.questions) ? result.questions : [];

      return {
        questions: questions
          .slice(0, 3)
          .map((q: any, idx: number) => ({
            title:
              typeof q?.title === 'string' && q.title.trim().length > 0
                ? q.title
                : `Coding Challenge ${idx + 1}`,
            difficulty:
              q?.difficulty === 'easy' || q?.difficulty === 'medium' || q?.difficulty === 'hard'
                ? q.difficulty
                : idx === 0
                  ? 'easy'
                  : idx === 1
                    ? 'medium'
                    : 'hard',
            prompt:
              typeof q?.prompt === 'string' && q.prompt.trim().length > 0
                ? q.prompt
                : 'Implement a solution for a role-relevant problem and explain trade-offs.',
            expected_topics: Array.isArray(q?.expected_topics)
              ? q.expected_topics.filter((t: unknown) => typeof t === 'string')
              : [],
          })),
      };
    } catch (error: any) {
      this.logger.error(
        'Coding practice generation failed',
        error?.message || error,
      );
      return {
        questions: [
          {
            title: 'Array Transform Challenge',
            difficulty: 'easy',
            prompt:
              'Given an array of transactions, return the top 3 users by total spend. Discuss time complexity.',
            expected_topics: ['arrays', 'sorting', 'hash maps'],
          },
        ],
      };
    }
  }

  async evaluateCodingSubmission(
    question: string,
    code: string,
    language: string,
  ) {
    try {
      const prompt = `
You are a coding interviewer. Evaluate the submitted solution.

Question:
${question}

Language: ${language}

Candidate code:
${code}

Output MUST be valid JSON exactly:
{
  "score": number,
  "feedback": string,
  "strengths": string[],
  "improvements": string[],
  "time_complexity": string,
  "space_complexity": string
}

Constraints:
- score must be 0 to 100
- feedback max 3 concise sentences
`;

      const result = await this.generateJson(prompt);
      return {
        score: Math.max(0, Math.min(100, Number(result?.score) || 0)),
        feedback:
          typeof result?.feedback === 'string'
            ? result.feedback
            : 'Your solution is partially correct. Improve edge case handling and complexity explanation.',
        strengths: Array.isArray(result?.strengths)
          ? result.strengths.filter((s: unknown) => typeof s === 'string')
          : [],
        improvements: Array.isArray(result?.improvements)
          ? result.improvements.filter((s: unknown) => typeof s === 'string')
          : [],
        time_complexity: typeof result?.time_complexity === 'string' ? result.time_complexity : 'O(N)',
        space_complexity: typeof result?.space_complexity === 'string' ? result.space_complexity : 'O(N)',
      };
    } catch (error: any) {
      this.logger.error('Coding evaluation failed', error?.message || error);
      throw new Error('AI coding evaluation failed');
    }
  }
}
