// signature.module.ts
import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { SignatureController } from './signature.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SignatureController],
  providers: [SignatureService],
  exports: [SignatureService], // Export for use in other modules
})
export class SignatureModule {}
