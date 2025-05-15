import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService, User } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): User | { message: string } {
    const user = this.usersService.findById(id);
    if (!user) return { message: 'User not found' };
    return user;
  }

  @Post()
  async createUser(
    @Body()
    body: {
      fullName: string;
      email: string;
      password: string;
      role: string;
    },
  ): Promise<User | { message: string }> {
    const { fullName, email, password, role } = body;
    const existingUser = this.usersService.findByEmail(email);
    if (existingUser) return { message: 'User with this email already exists' };
    const newUser = await this.usersService.createUser(
      fullName,
      email,
      password,
      role,
    );
    return newUser;
  }
}
