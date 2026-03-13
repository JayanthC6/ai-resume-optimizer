import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor() {}

  async optimizeResume(rawText: string, jobDescription: string) {
    try {
      const apiKey = process.env.GOOGLE_API_KEY || '';
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });

      const prompt = `
        You are an expert ATS resume optimizer.
        Analyze the following resume against the provided job description.
        Output MUST be valid JSON matching this schema:
        {
          "matchScore": number (0-100),
          "gapAnalysis": { "missingSkills": string[], "strengths": string[] },
          "rewrites": { "summary": string, "experienceText": string }
        }
        
        Resume: ${rawText}
        Job Description: ${jobDescription}
      `;

      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      this.logger.error('Optimization failed', error);
      throw new Error('AI processing failed');
    }
  }
}
