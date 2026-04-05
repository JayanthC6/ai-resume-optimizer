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

  private getJsonModel() {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      throw new Error(
        'Missing GOOGLE_API_KEY. Please set it in your environment.',
      );
    }

    const modelName = process.env.GOOGLE_GEMINI_MODEL;
    if (!modelName) {
      throw new Error(
        'Missing GOOGLE_GEMINI_MODEL. Set it to a valid Gemini model name returned by the ListModels API.',
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });
  }

  private async generateJson(prompt: string) {
    const model = this.getJsonModel();
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
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
      this.logger.error('Optimization failed', error?.message || error);
      throw new Error('AI processing failed');
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
}
