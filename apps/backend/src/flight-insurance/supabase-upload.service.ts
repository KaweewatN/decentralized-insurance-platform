// src/file-upload/supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';


@Injectable()
export class SupabaseService {
  private supabase;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL') as string;
    const key = this.configService.get<string>('SUPABASE_ANON_KEY') as string;
    this.supabase = createClient(url, key);
    
  }

  async uploadDocument(file: Express.Multer.File, userId: string): Promise<string> {
    const bucket = 'documents'; // Ensure this bucket is created in Supabase Storage
    const filePath = `${userId}/${Date.now()}-${file.originalname}`;

    const { error } = await this.supabase.storage.from(bucket).upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: publicUrlData } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }
}
