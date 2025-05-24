import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpType } from './types/auth.types';

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

  @Post('signup')
  async signup(@Body() userData: SignUpType) {
    if (!userData) {
      throw new HttpException('User data are required', HttpStatus.BAD_REQUEST);
    }
    return this.authService.signup(userData);
  }
}
