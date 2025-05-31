import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
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

  @Get('policy/:policyId/:planTypeId')
  async getPolicyByIdAndPlanType(
    @Param('policyId', ParseIntPipe) policyId: number,
    @Param('planTypeId', ParseIntPipe) planTypeId: number,
  ) {
    return this.policyService.getPolicyByIdAndPlanType(policyId, planTypeId);
  }
}
