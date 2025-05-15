import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Query,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { SupabaseService } from './supabase.service';
  
  @Controller('file-upload')
  export class FileUploadController {
    constructor(private readonly supabaseService: SupabaseService) {}
  
    @Post('upload-ticket')
    @UseInterceptors(FileInterceptor('file'))
    async uploadTicket(
      @UploadedFile() file: Express.Multer.File,
      @Query('userId') userId: string,
    ) {
      const url = await this.supabaseService.uploadDocument(file, userId);
      return { message: 'Upload successful', url };
    }
  }
  