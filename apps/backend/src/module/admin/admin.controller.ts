import { Controller, Get, Param, Put, ParseUUIDPipe } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly policyService: AdminService) {}

  @Get('all-policy-summary')
  async getAllPoliciesSummary() {
    return this.policyService.getAllPolicySummary();
  }

  @Get('all-policies')
  async getAllPolicies() {
    return this.policyService.getAllPolicies();
  }

  @Get('policy/:policyId')
  async getPolicyByIdAndPlanType(
    @Param('policyId', ParseUUIDPipe) policyId: string,
  ) {
    return this.policyService.getPolicyByIdAndPlanType(policyId);
  }

  @Put('policy/rejected/:policyId')
  async rejectPolicy(@Param('policyId', ParseUUIDPipe) policyId: string) {
    return this.policyService.rejectPolicy(policyId);
  }
}
