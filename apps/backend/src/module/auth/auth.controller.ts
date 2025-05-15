import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
  ): Promise<{ accessToken: string; user: User }> {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
