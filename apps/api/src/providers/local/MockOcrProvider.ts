import { OcrProvider, OcrResult } from '@ecotransit/shared';

export class MockOcrProvider implements OcrProvider {
  async processTicketImage(buffer: Buffer, base64Data?: string): Promise<OcrResult> {
    console.log(`MockOcrProvider: Processing ticket image. Buffer size: ${buffer.length} bytes.`);
    
    // Simulate OCR delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simple text trigger inside base64 to force different statuses for testing
    let forceStatus: string | null = null;
    if (base64Data) {
      if (base64Data.includes('force_reject')) {
        forceStatus = 'reject';
      } else if (base64Data.includes('force_review')) {
        forceStatus = 'review';
      } else if (base64Data.includes('force_verify')) {
        forceStatus = 'verify';
      }
    }

    if (forceStatus === 'reject') {
      return {
        ocrText: 'INVALID IMAGE OR EXPIRED TICKET DETAILS',
        confidence: 0.1,
        metadata: {
          isTicket: false,
        },
      };
    }

    if (forceStatus === 'review') {
      return {
        ocrText: 'METRO LINE 1 - LOW QUALITY SCAN - FARE: UNREADABLE',
        confidence: 0.45,
        metadata: {
          isTicket: true,
          stationName: 'Suối Tiên',
        },
      };
    }

    // Default returns high confidence verified ticket, occasionally giving low confidence
    const isLowConfidence = Math.random() < 0.15; // 15% random chance of entering manual review
    const confidence = isLowConfidence ? 0.48 : 0.94;

    return {
      ocrText: 'ECOTRANSIT PUBLIC TRANSIT TICKET\nLOAI VE: METRO SINGLE RIDE\nNGAY: 2026-06-15\nGIA VE: 15,000 VND\nGA DI: BEN THANH\nSTATUS: VALIDATED',
      confidence,
      metadata: {
        tripDate: new Date('2026-06-15'),
        fareEstimate: 15000,
        stationName: 'Bến Thành',
        isTicket: true,
      },
    };
  }
}
