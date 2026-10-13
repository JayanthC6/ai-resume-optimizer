import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ExtractedLink,
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

  private getTextModel(modelName: string) {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      throw new Error(
        'Missing GOOGLE_API_KEY. Please set it in your environment.',
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: modelName,
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
    const maxAttempts = 2;
    const models = this.getModelCandidates();
    let lastError: unknown;
    const startTime = Date.now();
    const MAX_TOTAL_TIME_MS = 90000;

    for (const modelName of models) {
      const model = this.getJsonModel(modelName);

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (Date.now() - startTime > MAX_TOTAL_TIME_MS) {
          throw new Error('The AI service is busy, please try again in a minute');
        }

        try {
          const result = await model.generateContent(prompt);
          if (modelName !== models[0]) {
            this.logger.warn(
              `AI call succeeded using fallback model: ${modelName}`,
            );
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

          const is404 = message.includes('404') || message.toLowerCase().includes('not found');
          if (is404) {
            this.logger.warn(`AI model ${modelName} returned 404 (Not Found). Please check if this model name is valid in your .env`);
            break;
          }

          const isRateLimit = message.toLowerCase().includes('429') || message.toLowerCase().includes('resource_exhausted') || message.toLowerCase().includes('quota');
          if (isRateLimit) {
            this.logger.warn(`AI model ${modelName} rate limited (429/Quota). Skipping to fallback.`);
            break;
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
          const delayMs = Math.min(
            30000,
            Math.max(computedDelayMs, suggestedDelayMs),
          );

          if (Date.now() - startTime + delayMs > MAX_TOTAL_TIME_MS) {
            break;
          }

          this.logger.warn(
            `AI call transient failure on ${modelName} (attempt ${attempt}/${maxAttempts}): ${message}. Retrying in ${delayMs}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw new Error('The AI service is busy, please try again in a minute');
  }

  private async generateText(prompt: string) {
    const maxAttempts = 2;
    const models = this.getModelCandidates();
    let lastError: unknown;
    const startTime = Date.now();
    const MAX_TOTAL_TIME_MS = 90000;

    for (const modelName of models) {
      const model = this.getTextModel(modelName);

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (Date.now() - startTime > MAX_TOTAL_TIME_MS) {
          throw new Error('The AI service is busy, please try again in a minute');
        }

        try {
          const result = await model.generateContent(prompt);
          if (modelName !== models[0]) {
            this.logger.warn(
              `AI call succeeded using fallback model: ${modelName}`,
            );
          }
          return result.response.text();
        } catch (error: any) {
          lastError = error;
          const message = String(error?.message || error || 'Unknown AI error');

          if (this.isPermanentQuotaExhaustion(message)) {
            throw new Error(
              'Gemini API quota exhausted for this key. Please use a different GOOGLE_API_KEY or wait for quota reset.',
            );
          }

          const is404 = message.includes('404') || message.toLowerCase().includes('not found');
          if (is404) {
            this.logger.warn(`AI model ${modelName} returned 404 (Not Found). Please check if this model name is valid in your .env`);
            break;
          }

          const isRateLimit = message.toLowerCase().includes('429') || message.toLowerCase().includes('resource_exhausted') || message.toLowerCase().includes('quota');
          if (isRateLimit) {
            this.logger.warn(`AI model ${modelName} rate limited (429/Quota). Skipping to fallback.`);
            break;
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
          const delayMs = Math.min(
            30000,
            Math.max(computedDelayMs, suggestedDelayMs),
          );

          if (Date.now() - startTime + delayMs > MAX_TOTAL_TIME_MS) {
            break;
          }

          this.logger.warn(
            `AI call transient failure on ${modelName} (attempt ${attempt}/${maxAttempts}): ${message}. Retrying in ${delayMs}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw new Error('The AI service is busy, please try again in a minute');
  }

  private isTransientAiError(message: string) {
    const normalized = message.toLowerCase();
    return (
      normalized.includes('503') ||
      normalized.includes('service unavailable') ||
      normalized.includes('timeout') ||
      normalized.includes('fetch failed') ||
      normalized.includes('econnreset') ||
      normalized.includes('etimedout')
    );
  }

  private isPermanentQuotaExhaustion(message: string) {
    const normalized = message.toLowerCase();
    return (
      normalized.includes('quota exceeded') &&
      (normalized.includes('perday') || normalized.includes('limit: 0'))
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

  private normalizeUrlForComparison(raw: string): string {
    if (!raw || typeof raw !== 'string') return '';
    const trimmed = raw.trim().replace(/\/+$/, '');
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      const pathname = parsed.pathname.replace(/\/+$/, '').toLowerCase();
      const search = parsed.search;
      return `${parsed.protocol.toLowerCase()}//${host}${pathname}${search}`;
    } catch {
      return trimmed.toLowerCase();
    }
  }

  private validateAndFilterUrl(
    url: any,
    allowedUrlsMap: Map<string, string>,
  ): string | undefined {
    if (!url || typeof url !== 'string') return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;
    const normalized = this.normalizeUrlForComparison(trimmed);
    if (allowedUrlsMap.has(normalized)) {
      return allowedUrlsMap.get(normalized)!;
    }
    return undefined;
  }

  async regenerateResume(
    rawText: string,
    jobTitle: string,
    jobDescription: string,
    companyName?: string,
    extractedLinks: ExtractedLink[] = [],
  ) {
    try {
      const linksListStr =
        extractedLinks.length > 0
          ? extractedLinks
              .map((l) => `- "${l.label}": ${l.url}`)
              .join('\n')
          : '(No links found in document)';

      const prompt = `
You are an expert resume writer and ATS optimization specialist.
You will EDIT the candidate's existing resume text.
Return the same resume content, improved for the target role.

VERIFIED EXTRACTED LINKS FROM CANDIDATE'S RESUME (Label -> URL):
${linksListStr}

CRITICAL RULES:
1. VERIFIED LINKS USAGE:
   - You may ONLY use URLs from the verified list above.
   - NEVER invent, fabricate, guess, or hallucinate ANY URL. If a URL is not present in the verified list above, leave the URL field empty or omitted.
   - Map links to the appropriate fields:
     * LinkedIn profile -> personalInfo.linkedin
     * GitHub profile -> personalInfo.github
     * Portfolio / website -> personalInfo.portfolio
     * Other platforms (e.g. LeetCode, HackerRank, CodeChef, Kaggle) -> personalInfo.additionalLinks [{ label, url }]
     * Project repositories or demos -> project.githubUrl, project.liveUrl, or project.link
     * Achievement links -> achievement.githubUrl

2. ABSOLUTE CONTENT RETENTION:
   - NEVER drop any project, achievement, research paper, publication, certification, or quantitative metric from the original resume.
   - Every single project present in the original resume MUST be retained in the "projects" array.
   - Every single achievement, honor, award, competition, or extracurricular item MUST be retained in the "achievements" array.
   - Preserve all specific quantitative metrics (e.g. percentages, test counts, API counts, numbers like "15+ APIs", "22 JUnit 5 tests", "500+ stocks") exactly.

3. SKILL CATEGORIES & PRESERVATION:
   - Preserve the skill categories and their names EXACTLY as they appear in the uploaded resume (do NOT rename them, do NOT merge or collapse them into 4-5 categories, and do NOT hard-code any specific categories, since this app serves many diverse candidates). Group the candidate's skills under their exact original category names.
   - ACCURACY: Never add missing job keywords or technologies as skills the candidate has if they did not exist in the original resume. Tailor framing and emphasize real existing skills, but NEVER fabricate skills.

4. PROFESSIONAL SUMMARY:
   - Keep the original summary, only lightly tailored to the target role.
   - Do NOT use exaggerated claims or buzzwords like "proven track record", "results-driven visionary", etc.
   - Do NOT add job titles that are not in the candidate's actual resume.

5. CONCISENESS & ONE-PAGE FIT:
   - Keep the result suitable for a single-page resume by tightening phrasing and shortening wording, NEVER by dropping sections, projects, achievements, bullets, or metrics.
   - Do NOT impose arbitrary truncation limits (such as max 2 bullets or 1-2 sentence projects); instead write tight, impactful, high-density bullet points that preserve all achievements and outcomes concisely.

Output MUST be valid JSON using this schema exactly:
{
  "updatedResume": {
    "personalInfo": {
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "linkedin": "string (URL from verified list only, or empty)",
      "github": "string (URL from verified list only, or empty)",
      "portfolio": "string (URL from verified list only, or empty)",
      "additionalLinks": [
        {
          "label": "string (e.g. LeetCode, HackerRank, CodeChef)",
          "url": "string (URL from verified list only)"
        }
      ]
    },
    "summary": "string",
    "experience": [
      {
        "company": "string",
        "title": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "bullets": ["string"]
      }
    ],
    "education": [
      {
        "institution": "string",
        "degree": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "gpa": "string"
      }
    ],
    "skills": [
      {
        "category": "string (Preserve original category name as written in resume)",
        "items": ["string"]
      }
    ],
    "projects": [
      {
        "name": "string",
        "technologies": ["string"],
        "description": "string",
        "bullets": ["string"],
        "link": "string (URL from verified list only, or empty)",
        "githubUrl": "string (URL from verified list only, or empty)",
        "liveUrl": "string (URL from verified list only, or empty)"
      }
    ],
    "achievements": [
      {
        "label": "string (e.g. Academic, Competition, Extracurricular)",
        "text": "string",
        "githubUrl": "string (URL from verified list only, or empty)"
      }
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

Target Role: ${jobTitle}
Company: ${companyName || 'Not specified'}
Job Description: ${jobDescription}

Original Resume:
${rawText}
`;

      const aiResult = await this.generateJson(prompt);
      const updatedResume =
        aiResult?.updatedResume || aiResult?.regeneratedResume || {};

      // Validate every URL field against extracted links to prevent invented URLs
      const allowedUrlsMap = new Map<string, string>();
      for (const link of extractedLinks) {
        if (link?.url) {
          allowedUrlsMap.set(
            this.normalizeUrlForComparison(link.url),
            link.url.trim(),
          );
        }
      }

      if (updatedResume?.personalInfo) {
        updatedResume.personalInfo.linkedin = this.validateAndFilterUrl(
          updatedResume.personalInfo.linkedin,
          allowedUrlsMap,
        );
        updatedResume.personalInfo.github = this.validateAndFilterUrl(
          updatedResume.personalInfo.github,
          allowedUrlsMap,
        );
        updatedResume.personalInfo.portfolio = this.validateAndFilterUrl(
          updatedResume.personalInfo.portfolio,
          allowedUrlsMap,
        );

        if (Array.isArray(updatedResume.personalInfo.additionalLinks)) {
          updatedResume.personalInfo.additionalLinks =
            updatedResume.personalInfo.additionalLinks
              .filter((item: any) =>
                Boolean(this.validateAndFilterUrl(item?.url, allowedUrlsMap)),
              )
              .map((item: any) => ({
                label: item.label || 'Link',
                url: this.validateAndFilterUrl(item?.url, allowedUrlsMap)!,
              }));
        }
      }

      if (Array.isArray(updatedResume?.projects)) {
        for (const proj of updatedResume.projects) {
          proj.link = this.validateAndFilterUrl(proj.link, allowedUrlsMap);
          proj.githubUrl = this.validateAndFilterUrl(
            proj.githubUrl,
            allowedUrlsMap,
          );
          proj.liveUrl = this.validateAndFilterUrl(
            proj.liveUrl,
            allowedUrlsMap,
          );
        }
      }

      if (Array.isArray(updatedResume?.achievements)) {
        for (const ach of updatedResume.achievements) {
          ach.githubUrl = this.validateAndFilterUrl(
            ach.githubUrl,
            allowedUrlsMap,
          );
        }
      }

      const linksFoundCount = extractedLinks.length;
      const projectsCount = Array.isArray(updatedResume?.projects)
        ? updatedResume.projects.length
        : 0;
      const achievementsCount = Array.isArray(updatedResume?.achievements)
        ? updatedResume.achievements.length
        : 0;
      const skillCategoriesCount = Array.isArray(updatedResume?.skills)
        ? updatedResume.skills.length
        : 0;

      this.logger.log(
        `Resume regenerated: links=${linksFoundCount}, projects=${projectsCount}, achievements=${achievementsCount}, skillCategories=${skillCategoriesCount}`,
      );

      return {
        regeneratedResume: updatedResume,
        updatedResume,
        highlights: Array.isArray(aiResult?.highlights)
          ? aiResult.highlights
          : [],
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
        recommended_minutes:
          mode === 'Technical' ? 45 : mode === 'Mixed' ? 50 : 30,
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
      const questions = Array.isArray(result?.questions)
        ? result.questions
        : [];

      return {
        questions: questions.slice(0, 3).map((q: any, idx: number) => ({
          title:
            typeof q?.title === 'string' && q.title.trim().length > 0
              ? q.title
              : `Coding Challenge ${idx + 1}`,
          difficulty:
            q?.difficulty === 'easy' ||
            q?.difficulty === 'medium' ||
            q?.difficulty === 'hard'
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
        time_complexity:
          typeof result?.time_complexity === 'string'
            ? result.time_complexity
            : 'O(N)',
        space_complexity:
          typeof result?.space_complexity === 'string'
            ? result.space_complexity
            : 'O(N)',
      };
    } catch (error: any) {
      this.logger.error('Coding evaluation failed', error?.message || error);
      throw new Error('AI coding evaluation failed');
    }
  }

  async analyzeJobMarket(resumeText: string, jobDescriptions: string[]) {
    try {
      const prompt = `
You are an expert ATS recruiter and hiring manager. The candidate wants to apply to several roles.
Here are the Job Descriptions they provided:
${jobDescriptions.map((jd, i) => `--- JD ${i + 1} ---\n${jd}`).join('\n')}

And here is the Candidate's Resume:
${resumeText}

Analyze the resume against these multiple job descriptions. 
Do NOT invent skills, employers, or numbers.

SCORING RUBRIC FOR EACH ROLE'S FIT SCORE (fitRanking from 0 to 100):
Compute each job's fit score from the resume using these weighted components:
1. REQUIRED Skills & Tools (weight 60%): The share of the job's explicitly REQUIRED skills, frameworks, languages, and tools that clearly and demonstrably appear in the resume.
2. PREFERRED / Nice-to-Have Items (weight 15%): The share of preferred, bonus, or secondary qualifications present in the resume.
3. Experience & Project Evidence (weight 15%): Concrete evidence of relevant work experience, responsibilities, scale, and projects matching the JD.
4. Education & Seniority / Level Match (weight 10%): Match with the required education, degree, and years of experience or seniority level.

MANDATORY SCORE CAPS & CALIBRATION RULES:
- If the resume is missing more than half (>50%) of the explicitly required skills or tools for a role, the fitRanking MUST NOT exceed 70.
- If the resume is missing many core skills (3 or more key technologies), the fitRanking MUST NOT exceed 80.
- Scores of 90 and above are strictly reserved for roles where nearly every required skill is present with clear evidence.
- Do NOT reward similar-sounding skills as matches (for example, Docker experience does NOT cover Kubernetes; React does NOT cover Angular; Java does NOT cover C#).
- Make the scores differ when the roles differ in fit; do NOT give nearly identical high scores to every role.
- Count ONLY skills that appear in the resume; never assume, infer, or extrapolate skills.

Output MUST be valid JSON using this exact schema:
{
  "jobTargets": [
    {
      "title": "string (inferred job title from JD)",
      "company": "string (inferred company from JD if any)",
      "jd": "string (the original JD text or summary)",
      "fitRanking": number (0-100 fit score for this specific JD adhering to the rubric and caps above)
    }
  ],
  "missingKeywords": [
    "string (keywords missing across MOST of the jobs)"
  ],
  "priorityList": [
    "string (a short 'learn these first' priority list based on the gaps)"
  ]
}
      `;

      return await this.generateJson(prompt);
    } catch (error: any) {
      this.logger.error('Job Market analysis failed', error?.message || error);
      throw new Error('AI Job Market analysis failed');
    }
  }

  async generateReverseQuestions(resumeText: string, jobDescription: string) {
    try {
      const prompt = `
        You are an expert technical recruiter and career coach.
        Based ONLY on the candidate's resume and the job description, generate strategic questions for the candidate to ask the interviewer.
        The questions should demonstrate deep engagement, highlight the candidate's strengths implicitly, and uncover valuable information about the role.
        Do NOT invent facts about the candidate or company.
        
        Group the questions strictly into these 4 topics: "team", "role success", "growth", "culture".
        For each question, provide a short one-line "reason" explaining why it's a good question to ask.
        
        Output MUST be valid JSON matching this schema exactly:
        {
          "team": [ { "question": "string", "reason": "string" } ],
          "role success": [ { "question": "string", "reason": "string" } ],
          "growth": [ { "question": "string", "reason": "string" } ],
          "culture": [ { "question": "string", "reason": "string" } ]
        }
        
        Resume: ${resumeText}
        Job Description: ${jobDescription}
      `;

      return await this.generateJson(prompt);
    } catch (error: any) {
      const message = String(error?.message || error || 'Unknown AI error');
      this.logger.error('Reverse questions generation failed', message);
      throw new Error(`AI processing failed: ${message}`);
    }
  }

  async generateOutreach(
    resumeText: string,
    jobDescription: string,
    type: string,
    tone: string,
    length: string,
  ): Promise<string> {
    try {
      const prompt = `
        You are an expert career coach and professional copywriter.
        Based ONLY on the candidate's resume and the job description, write a ${length} ${type.replace('_', ' ')} for the candidate.
        The tone should be ${tone}.
        
        CRITICAL RULES:
        1. Keep every claim traceable to the resume or job description. NEVER invent employers, degrees, numbers, certifications, or skills.
        2. Do not use strength words such as "extensive", "proven track record", "expert", "highly experienced", "mastered" or "deep expertise" unless the same level of claim appears in the resume. Describe experience at the level the resume shows (for example "hands-on experience", "worked with", "built").
        3. Weave in the most relevant matched skills naturally.
        4. Describe missing skills only as willingness to learn, NEVER as experience.
        5. Placeholders must always appear in square brackets exactly as [Company Name], [Hiring Manager], and [Your Phone/LinkedIn] so they are easy to spot. Never write them without brackets.
        6. Do NOT output markdown formatting like \`\`\` or bold tags. Output pure plain text.
        
        Resume:
        ${resumeText}
        
        Job Description:
        ${jobDescription}
      `;

      return await this.generateText(prompt);
    } catch (error: any) {
      const message = String(error?.message || error || 'Unknown AI error');
      this.logger.error('Outreach generation failed', message);
      throw new Error(`AI processing failed: ${message}`);
    }
  }
}
