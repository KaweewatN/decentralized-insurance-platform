import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { RainfallService } from './rainfall-insurance.service';

@Controller('rainfall-insurance')
export class RainfallInsuranceController {
    constructor(private readonly rainfallService: RainfallService) { }

    @Get('estimate-premium')
    async estimatePremium(
        @Query('lat') lat: string,
        @Query('lon') lon: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('threshold') threshold: string,
        @Query('coverageAmount') coverageAmount: string,
        @Query('conditionType') conditionType: 'below' | 'above' // NEW
    ): Promise<{
        location?: { latitude: number; longitude: number };
        coveragePeriod?: { startDate: string; endDate: string };
        threshold?: number;
        conditionType?: 'below' | 'above';
        coverageAmount?: number;
        triggerProbability?: number;
        expectedPayout?: number;
        finalPremium?: number;
        error?: string;
    }> {
        // Parse input values
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        const thresholdNum = parseFloat(threshold);
        const coverageAmountNum = parseFloat(coverageAmount);

        // Input validation
        if (
            isNaN(latNum) ||
            isNaN(lonNum) ||
            isNaN(thresholdNum) ||
            isNaN(coverageAmountNum)
        ) {
            return { error: 'Invalid input: latitude, longitude, threshold, and coverageAmount must be numbers.' };
        }

        if (conditionType !== 'below' && conditionType !== 'above') {
            return { error: 'Invalid conditionType. Must be either "below" (drought) or "above" (flood).' };
        }

        // Call service
        return await this.rainfallService.assessRiskAndCalculatePremium(
            latNum,
            lonNum,
            startDate,
            endDate,
            thresholdNum,
            coverageAmountNum,
            conditionType
        );
    }
    @Post('apply-policy')
    applyPolicy(@Body() body: any) {
        return this.rainfallService.submitApplication(body);
    }

    @Patch('admin-review')
    adminReview(@Body() body: { applicationId: number; approved: boolean }) {
        return this.rainfallService.reviewApplication(body.applicationId, body.approved);
    }

    @Get('pending-applications')
    getPendingApplications() {
        return this.rainfallService.getPendingApplications();
    }

    @Get('sign-policy/:applicationId')
    signPolicy(@Param('applicationId') applicationId: string) {
        const id = parseInt(applicationId);
        if (isNaN(id)) {
            return { error: 'Invalid applicationId' };
        }
        return this.rainfallService.signApprovedPolicy(id);
    }

    // ✅ Confirm payment after on-chain transaction
    @Post('confirm-payment')
    async confirmPayment(
        @Body() body: { applicationId: number; policyIdOnChain: number; transactionHash: string }
    ) {
        return this.rainfallService.confirmPayment(
            body.applicationId,
            body.policyIdOnChain,
            body.transactionHash
        );
    }

    @Get('is-approved/:applicationId')
    async isApproved(@Param('applicationId') applicationId: string) {
        const id = parseInt(applicationId);
        if (isNaN(id)) {
            return { error: 'Invalid applicationId' };
        }
        return this.rainfallService.isApplicationApproved(id);
    }


}


