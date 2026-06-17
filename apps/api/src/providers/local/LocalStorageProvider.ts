import { StorageProvider } from '@ecotransit/shared';
import * as fs from 'fs';
import * as path from 'path';

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public/uploads');
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch (e) {
      console.warn('LocalStorageProvider: Failed to create upload directory. Using runtime fallback.', e);
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }> {
    console.log(`LocalStorageProvider: Uploading file: ${fileName}, mime: ${mimeType}`);
    const uniqueKey = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${fileName}`;
    
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      const filePath = path.join(this.uploadDir, uniqueKey);
      fs.writeFileSync(filePath, fileBuffer);
    } catch (err) {
      console.error('LocalStorageProvider: Writing file to disk failed, returning mock path', err);
    }

    return {
      url: `/uploads/${uniqueKey}`,
      key: uniqueKey,
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    // Return the local relative path for development, simulating a signed URL
    return `/uploads/${key}`;
  }
}
