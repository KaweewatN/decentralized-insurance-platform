import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const key = this.configService.get<string>('SUPABASE_ANON_KEY')!;
    this.supabase = createClient(url, key);
  }

  // Public getter to allow access to the Supabase client from other services
  get client(): SupabaseClient {
    return this.supabase;
  }

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    const bucket = 'flight-insurance-document';
    const filePath = `${userId}/${Date.now()}-${file.originalname}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  async uploadDocumentBase64(
    fileBase64: string, // File as a Base64 string
    fileName: string,
    userId: string,
  ): Promise<string> {
    const bucket = 'flight-insurance-document';
    const filePath = `${userId}/${Date.now()}-${fileName}`;

    // Decode the Base64 string into a Buffer
    const fileBuffer = Buffer.from(
      fileBase64.replace(/^data:.*;base64,/, ''), // Remove the Base64 prefix if present
      'base64',
    );

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: this.getMimeType(fileBase64), // Infer MIME type from Base64 string
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // Helper method to infer MIME type from Base64 string
  private getMimeType(base64: string): string {
    const match = base64.match(/^data:(.*?);base64,/);
    return match ? match[1] : 'application/octet-stream';
  }
}
