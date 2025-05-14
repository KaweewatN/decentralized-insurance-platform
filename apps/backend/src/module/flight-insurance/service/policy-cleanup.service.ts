import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../file-upload/supabase.service';
import * as dayjs from 'dayjs';

@Injectable()
export class PolicyCleanupService {
  private readonly logger = new Logger(PolicyCleanupService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireUnpaidApplications() {
    this.logger.log('⏳ Running daily policy expiration job...');

    const fiveDaysAgo = dayjs().subtract(5, 'day').toISOString();
    const today = dayjs().startOf('day').format('YYYY-MM-DD'); // Assumes flight_date is in YYYY-MM-DD format

    const { error } = await this.supabaseService.client
      .from('flight_applications')
      .update({ status: 'Expired' })
      .or(`created_at.lt.${fiveDaysAgo},flight_date.lt.${today}`)
      .is('policy_created_at', null)
      .in('status', ['PendingApproval', 'Approved']);

    if (error) {
      this.logger.error('❌ Expiration job failed:', error.message);
    } else {
      this.logger.log(
        '✅ Expired unpaid or outdated applications successfully.',
      );
    }
  }
}
