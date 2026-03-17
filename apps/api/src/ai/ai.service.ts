import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor() { }

  async optimizeResume(rawText: string, jobDescription: string) {
    try {
      const apiKey = process.env.GOOGLE_API_KEY || '';
      if (!apiKey) {
        throw new Error('Missing GOOGLE_API_KEY. Please set it in your environment.');
      }

      const modelName = process.env.GOOGLE_GEMINI_MODEL;
      if (!modelName) {
        throw new Error(
          'Missing GOOGLE_GEMINI_MODEL. Set it to a valid Gemini model name returned by the ListModels API.'
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

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

      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error: any) {
      this.logger.error('Optimization failed', error?.message || error);
      throw new Error('AI processing failed');
    }
  }

  async regenerateResume(rawText: string, jobTitle: string, jobDescription: string) {
    try {
      const apiKey = process.env.GOOGLE_API_KEY || '';
      if (!apiKey) {
        throw new Error('Missing GOOGLE_API_KEY. Please set it in your environment.');
      }

      const modelName = process.env.GOOGLE_GEMINI_MODEL;
      if (!modelName) {
        throw new Error(
          'Missing GOOGLE_GEMINI_MODEL. Set it to a valid Gemini model name returned by the ListModels API.'
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
You are an expert resume writer and ATS optimization specialist.
Rewrite the resume to match the target role and job description.

Rules:
- Preserve factual accuracy from original resume.
- Do not invent employers, dates, degrees, or certifications.
- Improve clarity, impact, and ATS keyword alignment.
- Use concise, strong bullet points and measurable outcomes where possible.

Output MUST be valid JSON using this schema exactly:
{
  "regeneratedResume": string,
  "highlights": string[]
}

The regeneratedResume should include clear sections:
1) Professional Summary
2) Skills
3) Experience (rewritten bullets)
4) Education

Target Role: ${jobTitle}
Job Description: ${jobDescription}

Original Resume:
${rawText}
`;

      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error: any) {
      this.logger.error('Resume regeneration failed', error?.message || error);
      throw new Error('AI resume regeneration failed');
    }
  }
}