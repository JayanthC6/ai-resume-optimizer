import { Injectable, Logger } from '@nestjs/common';
// @ts-ignore
import PDFParser from 'pdf2json';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(private prisma: PrismaService) { }

  async parseAndSave(userId: string, file: any) {
    try {
      // Basic text extraction for PDF. In a real app, buffer streams are safer.
      const rawText = await this.extractText(file.buffer);

      const resume = await this.prisma.resume.create({
        data: {
          userId,
          originalFilename: file.originalname,
          s3Key: `local-storage/${Date.now()}_${file.originalname}`,
          rawText,
        },
      });

      return { resumeId: resume.id, status: 'completed' };
    } catch (e) {
      this.logger.error('Failed to parse resume', e);
      throw new Error('Failed to parse resume document');
    }
  }

  private extractText(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const pdfParser = new PDFParser(this, 1);

      // Temporarily suppress noisy pdf2json warnings
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const msg = args?.[0]?.toString?.() || '';
        if (
          msg.includes('Unsupported: field.type of Link') ||
          msg.includes('NOT valid form element')
        ) {
          return;
        }
        originalWarn(...args);
      };

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.warn = originalWarn;
        reject(errData.parserError);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        console.warn = originalWarn;
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });
  }
}