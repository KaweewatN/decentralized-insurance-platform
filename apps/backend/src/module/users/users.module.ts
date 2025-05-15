import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashingService } from '../utils/hashing.service';
import { BlockchainService } from '../utils/blockchain.service';

@Module({
  providers: [UsersService, HashingService, BlockchainService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
