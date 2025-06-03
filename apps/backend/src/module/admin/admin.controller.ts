import {
  Controller,
  Get,
  Param,
  Put,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('all-policy-summary')
  async getAllPoliciesSummary() {
    return this.adminService.getAllPolicySummary();
  }

  @Get('all-policies')
  async getAllPolicies() {
    return this.adminService.getAllPolicies();
  }

  @Get('policy/:policyId')
  async getPolicyByIdAndPlanType(
    @Param('policyId', ParseUUIDPipe) policyId: string,
  ) {
    return this.adminService.getPolicyByIdAndPlanType(policyId);
  }

  @Put('policy/rejected/:policyId')
  async rejectPolicy(@Param('policyId', ParseUUIDPipe) policyId: string) {
    return this.adminService.rejectPolicy(policyId);
  }

  @Get('claims')
  async getAllClaims() {
    try {
      const result = await this.adminService.getAllClaims();
      return {
        success: true,
        message: 'Claims fetched successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error ? error.message : 'Failed to fetch claims',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('claims/:claimId')
  async getClaimById(@Param('claimId') claimId: string) {
    try {
      const claim = await this.adminService.getClaimById(claimId);
      return {
        success: true,
        message: 'Claim fetched successfully',
        data: claim,
      };
    } catch (error) {
      const status =
        error instanceof Error && error.message === 'Claim not found'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error ? error.message : 'Failed to fetch claim',
        },
        status,
      );
    }
  }
  @Put('claims/:claimId/reject')
  async rejectClaim(@Param('claimId') claimId: string) {
    try {
      const updatedClaim = await this.adminService.rejectClaim(claimId);
      return {
        success: true,
        message: 'Claim rejected successfully',
        data: updatedClaim,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error instanceof Error ? error.message : 'Failed to reject claim',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
