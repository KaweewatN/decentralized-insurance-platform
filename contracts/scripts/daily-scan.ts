import { ethers } from "ethers";
import RainfallABI from "../artifacts/contracts/RainfallInsurance.sol/RainfallInsurance.json";
import * as dotenv from "dotenv";
import fs from "fs";
import vm from "vm";
import axios from "axios";

dotenv.config();

const RAINFALL_SCRIPT = "scripts/rainfall-check.js";

function isPolicyReady(endDate: string): boolean {
    const endDateObj = new Date(endDate + "T00:00:00Z");
    const readyDate = new Date(endDateObj.getTime() + 3 * 24 * 60 * 60 * 1000);
    return new Date() > readyDate;
}

async function runRainfallCheck(args: string[]): Promise<boolean> {
    const sourceCode = fs.readFileSync(RAINFALL_SCRIPT, "utf8");
    const context = {
        args,
        axios,
        console,
        BigInt,
        Buffer,
        fetch,
        Function,
        Uint8Array,
        parseFloat,
        Math,
        Number,
        require,
        Date,
        module,
        setTimeout,
    };

    const script = new vm.Script(`${sourceCode}\n;run()`);
    const sandbox = vm.createContext(context);
    return await script.runInContext(sandbox);
}

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL!);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    const contract = new ethers.Contract(
        process.env.RAINFALL_CONTRACT_ADDRESS!,
        RainfallABI.abi,
        wallet
    );

    const policyCounter = await contract.policyCounter();

    console.log(`🔎 Scanning ${policyCounter} policies...\n`);

    for (let policyId = 0; policyId < policyCounter; policyId++) {
        const policy = await contract.getPolicy(policyId);

        const statusValue = Number(policy.status);
        const statusMap = ["Pending", "Active", "Claimed", "Rejected"];
        const statusText = statusMap[statusValue] || "Unknown";

        console.log(`📄 Policy ${policyId} | Status: ${statusText} (${statusValue}) | End: ${policy.endDate}`);

        if (statusValue !== 1) {
            console.log(`⛔ Skipping: Policy is not Active\n`);
            continue;
        }

        if (!isPolicyReady(policy.endDate)) {
            console.log(`⏳ Skipping: Policy is not yet 3 days past end date\n`);
            continue;
        }

        const lat = policy.latitude.toString();
        const lon = policy.longitude.toString();
        const threshold = policy.threshold.toString();
        const condition = Number(policy.conditionType) === 0 ? "below" : "above";

        const args = [lat, lon, policy.startDate, policy.endDate, threshold, condition];

        console.log(`📡 Running rainfall check for Policy ${policyId}...`);

        let result: boolean;
        try {
            result = await runRainfallCheck(args);
        } catch (err) {
            console.error(`❌ Rainfall check failed for Policy ${policyId}:`, err);
            continue;
        }

        try {
            const tx = await contract.manualFulfill(policyId, result);
            await tx.wait();
            console.log(`✅ Fulfilled Policy ${policyId} | Result: ${result}\n`);
        } catch (err: any) {
            const reason = err?.error?.message || err?.reason || err?.message;
            if (reason?.includes("Insufficient contract balance")) {
                console.error(`❌ Skipped Policy ${policyId}: Contract has insufficient funds for payout\n`);
            } else {
                console.error(`❌ Error fulfilling Policy ${policyId}:`, reason, "\n");
            }
        }
    }

    console.log("✅ Daily scan complete");
}

main();



