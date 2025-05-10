import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FlightInsuranceService } from './flight-insurance.service';
import { SupabaseService } from '../file-upload/supabase.service';


@Controller('flight-insurance')
export class FlightInsuranceController {
  constructor(
    private readonly flightInsuranceService: FlightInsuranceService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('estimate-premium')
  async estimatePremium(
    @Query('airline') airline: string,
    @Query('depAirport') depAirport: string,
    @Query('arrAirport') arrAirport: string,
    @Query('depTime') depTime: string,
    @Query('flightDate') flightDate: string,
    @Query('depCountry') depCountry: string,
    @Query('arrCountry') arrCountry: string,
    @Query('coverageAmount') coverageAmount: number,
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
    );
  }

  @Post('upload-ticket')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTicket(
    @UploadedFile() file: Express.Multer.File,
    @Query('userId') userId: string,
  ) {
    const url = await this.supabaseService.uploadDocument(file, userId);
    return { message: 'Upload successful', url };
  }

  @Post('submit-application')
  async submitApplication(@Body() body: any) {
    return this.flightInsuranceService.submitApplication(body);
  }

  @Post('approve-application')
async approveApplication(@Query('id') id: string) {
  return this.flightInsuranceService.approveApplication(id);
}

@Get('verify-eligibility')
async verifyEligibility(@Query('applicationId') applicationId: string) {
  return this.flightInsuranceService.verifyAndPayEligibility(applicationId);
}

@Post('verify-and-pay')
async verifyAndPay(@Body('applicationId') applicationId: string) {
  return this.flightInsuranceService.verifyAndPay(applicationId);
}

}


