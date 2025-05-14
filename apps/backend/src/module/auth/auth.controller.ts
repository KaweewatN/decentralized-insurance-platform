import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signin(@Body('walletAddress') walletAddress: string) {
    if (!walletAddress) {
      throw new HttpException(
        'Wallet address are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.signin(walletAddress);
  }
}
