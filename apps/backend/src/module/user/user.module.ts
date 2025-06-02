import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../../service/prisma/prisma.service';
import { SupabaseClaimService } from 'module/file-upload/supabase.claim.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, SupabaseClaimService],
})
export class UserModule {}
