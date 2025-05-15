import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { HashingService } from '../utils/hashing.service';
import { BlockchainService } from '../utils/blockchain.service';

/**
 * User Type Definition
 */
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  walletAddress: string;
}

@Injectable()
export class UsersService {
  private usersFile = path.resolve(__dirname, 'users.mock.json');

  constructor(
    private readonly hashingService: HashingService,
    private readonly blockchainService: BlockchainService,
  ) {}

  findAll(): User[] {
    const data = fs.readFileSync(this.usersFile, 'utf-8');
    return JSON.parse(data) as User[];
  }

  findById(id: string): User | undefined {
    const users = this.findAll();
    return users.find((user) => user.id === id);
  }

  findByEmail(email: string): User | undefined {
    const users = this.findAll();
    return users.find((user) => user.email === email);
  }

  async createUser(
    fullName: string,
    email: string,
    password: string,
    role: string,
  ): Promise<User> {
    const users = this.findAll();
    const userId = `USER-${users.length + 1}`;
    const passwordHash = this.hashingService.hashPassword(password);
    const walletAddress = await this.blockchainService.generateWalletAddress();

    const newUser: User = {
      id: userId,
      fullName,
      email,
      passwordHash,
      role,
      walletAddress,
    };

    users.push(newUser);
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));

    return newUser;
  }

  verifyPassword(user: User, password: string): boolean {
    return this.hashingService.verifyPassword(password, user.passwordHash);
  }
}
