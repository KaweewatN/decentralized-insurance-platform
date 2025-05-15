import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/module/auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { FlightInsuranceService } from './flight-insurance.service';
import { SupabaseService } from '../file-upload/supabase.service';
import { ParseFloatPipe } from '@nestjs/common';

@Controller('flight-insurance')
export class FlightInsuranceController {
  constructor(
    private readonly flightInsuranceService: FlightInsuranceService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('estimate-premium')
  @UseGuards(JwtGuard)
  async estimatePremium(
    @Query('airline') airline: string,
    @Query('depAirport') depAirport: string,
    @Query('arrAirport') arrAirport: string,
    @Query('depTime') depTime: string,
    @Query('flightDate') flightDate: string,
    @Query('depCountry') depCountry: string,
    @Query('arrCountry') arrCountry: string,
    @Query('coverageAmount', ParseFloatPipe) coverageAmount: number,
    @Query('numPersons') numPersons: number,
  ) {
    return this.flightInsuranceService.estimatePremium(
      airline,
      depAirport,
      arrAirport,
      depTime,
      flightDate,
      depCountry,
      arrCountry,
      coverageAmount,
      numPersons,
    );
  }

  @Post('upload-ticket')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadTicket(
    @UploadedFile() file: Express.Multer.File,
    @Query('userId') userId: string,
  ) {
    const url = await this.supabaseService.uploadDocument(file, userId);
    return { message: 'Upload successful', url };
  }

  // Submitting the application from user
  // stores the application in the database
  @Post('submit-application')
  async submitApplication(@Body() body: any) {
    return this.flightInsuranceService.submitApplication(body);
  }

  @Post('approve-application')
  async approveApplication(@Query('id') id: string) {
    return this.flightInsuranceService.approveApplication(id);
  }

  @Post('verify-and-pay')
  async verifyAndPay(@Body('applicationId') applicationId: string) {
    return this.flightInsuranceService.verifyAndPay(applicationId);
  }

  @Post('confirm-payment')
  async confirmPayment(
    @Body('applicationId') applicationId: string,
    @Body('policyIdOnChain') policyIdOnChain: number,
    @Body('transactionHash') transactionHash: string,
  ) {
    return this.flightInsuranceService.confirmPayment(
      applicationId,
      policyIdOnChain,
      transactionHash,
    );
  }

  @Get('is-approved')
  async checkApproval(@Query('applicationId') applicationId: string) {
    const isApproved =
      await this.flightInsuranceService.isApplicationApproved(applicationId);
    return { approved: isApproved };
  }

  @Post('generate-signature')
  async generateSignature(@Body() body: any) {
    const { flightNumber, coveragePerPerson, numPersons, totalPremium } = body;

    return this.flightInsuranceService.generateSignature(
      flightNumber,
      coveragePerPerson,
      numPersons,
      totalPremium,
    );
  }

  @Get('user-policies')
  async getUserPolicies(@Query('userAddress') userAddress: string) {
    if (!userAddress) {
      return { error: 'Missing userAddress in query' };
    }
    const history = await this.flightInsuranceService.getUserPolicyHistory(userAddress);
    return { policies: history };
  }



}
