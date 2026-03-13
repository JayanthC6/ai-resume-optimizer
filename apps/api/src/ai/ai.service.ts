import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private model: string;

  constructor(private configService: ConfigService) {
    // Get GOOGLE_GEMINI_MODEL from environment variables, default to 'gemini-1.5-flash-001'
    this.model = this.configService.get<string>('GOOGLE_GEMINI_MODEL') || 'gemini-1.5-flash-001';

    // Validate GOOGLE_API_KEY
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('Missing GOOGLE_API_KEY. Please set it in the environment variables.');
    }
  }

  // Improved error logging
  private handleError(error: any): void {
    console.error('An error occurred:', error.message || error);
    // Further logging logic can be added here
  }

  // ... other methods that utilize the model and handle errors accordingly
}