import { Injectable, Logger } from '@nestjs/common';
// @ts-ignore
import PDFParser from 'pdf2json';
import { getDocumentProxy } from 'unpdf';
import { ExtractedLink } from '@repo/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(private prisma: PrismaService) {}

  async parseAndSave(userId: string, file: any) {
    try {
      // Basic text extraction for PDF. In a real app, buffer streams are safer.
      const rawText = await this.extractText(file.buffer);
      const extractedLinks = await this.extractPdfLinks(file.buffer);

      const resume = await this.prisma.resume.create({
        data: {
          userId,
          originalFilename: file.originalname,
          s3Key: `local-storage/${Date.now()}_${file.originalname}`,
          rawText,
          parsedData: {
            extractedLinks: extractedLinks as any,
          },
        },
      });

      return { resumeId: resume.id, status: 'completed' };
    } catch (e) {
      this.logger.error('Failed to parse resume', e);
      throw new Error('Failed to parse resume document');
    }
  }

  async extractPdfLinks(buffer: Buffer): Promise<ExtractedLink[]> {
    try {
      const doc = await getDocumentProxy(new Uint8Array(buffer));
      const extracted: ExtractedLink[] = [];
      const seen = new Set<string>();

      for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const [annotations, textContent] = await Promise.all([
          page.getAnnotations(),
          page.getTextContent(),
        ]);

        const textItems = (textContent?.items || []).filter(
          (item: any) =>
            typeof item?.str === 'string' &&
            item.str.trim().length > 0 &&
            Array.isArray(item?.transform),
        );

        for (const annot of annotations) {
          if (
            annot.subtype !== 'Link' ||
            !annot.url ||
            typeof annot.url !== 'string'
          ) {
            continue;
          }

          const rawUrl = annot.url.trim();
          const lowerUrl = rawUrl.toLowerCase();
          // Keep only https, http and mailto
          if (
            !lowerUrl.startsWith('https://') &&
            !lowerUrl.startsWith('http://') &&
            !lowerUrl.startsWith('mailto:')
          ) {
            continue;
          }

          const label = this.matchAnnotationLabel(annot, textItems);
          const pairKey = `${label.toLowerCase()}:::${rawUrl.toLowerCase()}`;
          if (!seen.has(pairKey)) {
            seen.add(pairKey);
            extracted.push({ label, url: rawUrl });
          }
        }
      }

      return extracted;
    } catch (err) {
      this.logger.warn('Failed to extract PDF links with unpdf', err);
      return [];
    }
  }

  private matchAnnotationLabel(annot: any, textItems: any[]): string {
    const rect = annot.rect;
    if (!rect || !Array.isArray(rect) || rect.length < 4) {
      return (annot.overlaidText || annot.contentsObj?.str || '').trim();
    }

    const annotLeft = Math.min(rect[0], rect[2]);
    const annotRight = Math.max(rect[0], rect[2]);
    const annotBottom = Math.min(rect[1], rect[3]);
    const annotTop = Math.max(rect[1], rect[3]);

    const tolerance = 4;
    const matched: Array<{ str: string; x: number; y: number }> = [];

    for (const item of textItems) {
      if (!item.str || !item.str.trim()) continue;
      const tx = Number(item.transform[4]);
      const ty = Number(item.transform[5]);
      const fontHeight = Math.abs(
        Number(item.transform[0] || item.transform[3] || item.height || 10),
      );
      const itemWidth = Number(item.width || 0);

      const textLeft = tx;
      const textRight = tx + itemWidth;
      const textBottom = ty - fontHeight * 0.35;
      const textTop = ty + fontHeight * 1.1;

      const overlapsX =
        textLeft <= annotRight + tolerance &&
        textRight >= annotLeft - tolerance;
      const overlapsY =
        textBottom <= annotTop + tolerance &&
        textTop >= annotBottom - tolerance;

      if (overlapsX && overlapsY) {
        matched.push({
          str: item.str,
          x: tx,
          y: ty,
        });
      }
    }

    if (matched.length > 0) {
      matched.sort((a, b) => {
        if (Math.abs(b.y - a.y) > 2) {
          return b.y - a.y;
        }
        return a.x - b.x;
      });
      const label = matched
        .map((m) => m.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (label) return label;
    }

    const fallback = (
      annot.overlaidText ||
      annot.contentsObj?.str ||
      ''
    ).trim();
    if (fallback) return fallback;

    // Derive label from url if no text matched
    const url = annot.url || '';
    if (url.startsWith('mailto:')) return url.replace(/^mailto:/i, '');
    if (/linkedin\.com/i.test(url)) return 'LinkedIn';
    if (/github\.com/i.test(url)) return 'GitHub';
    if (/leetcode\.com/i.test(url)) return 'LeetCode';
    if (/hackerrank\.com/i.test(url)) return 'HackerRank';
    return url;
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
        const parserError = errData?.parserError;
        reject(
          parserError instanceof Error
            ? parserError
            : new Error(String(parserError ?? 'PDF parsing failed')),
        );
      });

      pdfParser.on('pdfParser_dataReady', () => {
        console.warn = originalWarn;
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });
  }
}
