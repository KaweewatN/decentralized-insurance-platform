import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ethers } from 'ethers';
import * as contractJson from '../../../../contracts/artifacts/contracts/FlightDelayInsurance.sol/FlightInsurance.json';

@Injectable()
export class OracleFlightService {
  private readonly logger = new Logger(OracleFlightService.name);
  private contract: ethers.Contract;

  constructor() {
    const sepoliaRpc = process.env.SEPOLIA_RPC;
    const privateKey = process.env.ORACLE_WALLET_PRIVATE_KEY;
    const contractAddress = process.env.FLIGHT_CONTRACT_ADDRESS;

    if (!sepoliaRpc || !privateKey || !contractAddress) {
      throw new Error('❌ Missing required environment variables.');
    }

    const provider = new ethers.JsonRpcProvider(sepoliaRpc);
    const wallet = new ethers.Wallet(privateKey, provider);
    this.contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);
  }

  // Mock delay and flight times
  private mockDelays: Record<number, number> = {
    0: 150, // ✅ Flight 1 day ago → partial payout
    1: 300, // ✅ Flight 1 day ago → full payout
    2: 90,  // ✅ Flight 1 day ago → no payout (delay too small)
    3: 100, // ✅ Flight 1 day ago → no payout (just below threshold)
    4: 200, // ✅ Flight 1 day ago → partial payout

    5: 150, // ❌ Flight 3 days ago → expired (grace period passed)
    6: 300, // ❌ Flight 3 days ago → expired
    7: 180, // ❌ Flight 3 days ago → expired

    8: 150, // 🟡 Flight in future → should skip
    9: 300, // 🟡 Flight in future → should skip
    10: 90, // 🟡 Flight in future → should skip

    11: 180, // ✅ Flight 1.5 days ago → within grace → should process
    12: 100, // ✅ Flight 1.5 days ago → within grace → might not qualify
    13: 250, // ✅ Flight 1.5 days ago → within grace → full payout
    14: 300  // ✅ Flight 1.5 days ago → full payout
  };

  private mockFlightTimes: Record<number, number> = {
    0: Math.floor(Date.now() / 1000) - 86400,        // 1 day ago
    1: Math.floor(Date.now() / 1000) - 86400,        // 1 day ago
    2: Math.floor(Date.now() / 1000) - 86400,        // 1 day ago
    3: Math.floor(Date.now() / 1000) - 86400,        // 1 day ago
    4: Math.floor(Date.now() / 1000) - 86400,        // 1 day ago

    5: Math.floor(Date.now() / 1000) - 3 * 86400,    // 3 days ago → expired
    6: Math.floor(Date.now() / 1000) - 3 * 86400,    // 3 days ago → expired
    7: Math.floor(Date.now() / 1000) - 3 * 86400,    // 3 days ago → expired

    8: Math.floor(Date.now() / 1000) + 1 * 86400,    // 1 day in future → skip
    9: Math.floor(Date.now() / 1000) + 2 * 86400,    // 2 days in future → skip
    10: Math.floor(Date.now() / 1000) + 3 * 86400,   // 3 days in future → skip

    11: Math.floor(Date.now() / 1000) - 1.5 * 86400, // 1.5 days ago → process
    12: Math.floor(Date.now() / 1000) - 1.5 * 86400, // 1.5 days ago → process
    13: Math.floor(Date.now() / 1000) - 1.5 * 86400, // 1.5 days ago → process
    14: Math.floor(Date.now() / 1000) - 1.5 * 86400  // 1.5 days ago → process
  };

  @Cron('0 * * * *') // Every hour at minute 0
  async handleScheduledChecks() {
    this.logger.log('🔁 Running scheduled flight status check...');

    const totalPolicies = await this.contract.policyCounter();

    for (let policyId = 0; policyId < totalPolicies; policyId++) {
      try {
        const policy = await this.contract.policies(policyId);

        const status = Number(policy.status);
        const realFlightTime = Number(policy.flightTime);
        const now = Math.floor(Date.now() / 1000);

        // Use mock data for testing
        const flightTime = this.mockFlightTimes[policyId] ?? realFlightTime;
        const delay = this.mockDelays[policyId] ?? 0;

        this.logger.log(
          `🔍 Policy ${policyId} status=${status}, flightTime=${flightTime}, now=${now}`
        );

        if (status !== 0) continue; // Skip non-active policies
        if (flightTime > now) {
          this.logger.warn(`✈️ Flight hasn't happened yet for policy ${policyId}`);
          continue;
        }

        const isExpired = now > (flightTime + 2 * 86400);

        this.logger.log(
          `🧪 Checking policy ${policyId} → delay=${delay}, mockFlightTime=${flightTime}, isExpired=${isExpired}`
        );

        if (isExpired) {
          this.logger.log(`⏰ Expiring policy ${policyId} (grace period passed)...`);
          const tx = await this.contract.expirePolicy(policyId);
          await tx.wait();
          this.logger.log(`✅ Policy ${policyId} marked as expired`);
        } else {
          this.logger.log(`💸 Processing policy ${policyId} (delay: ${delay} mins)...`);
          const tx = await this.contract.processFlightStatus(policyId, delay);
          await tx.wait();

          const updated = await this.contract.policies(policyId);
          this.logger.log(`✅ Processed policy ${policyId}`);
          this.logger.log(`🎯 eligibleForPayout: ${updated.eligibleForPayout}`);
        }
      } catch (err: any) {
        this.logger.error(
          `❌ Error processing policy ${policyId}:`,
          err.reason || err.message || err
        );
      }
    }

    this.logger.log('✅ Scheduled check complete.');
    this.logger.log(`📦 Total policies found: ${totalPolicies}`);
  }
}


