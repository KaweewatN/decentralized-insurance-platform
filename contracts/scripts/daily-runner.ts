import cron from "node-cron";
import { exec } from "child_process";
import path from "path";

// ✅ Log current time and path
const timestamp = () => new Date().toLocaleString();

const scanScriptPath = path.join(__dirname, "daily-scan.ts");

// ⏰ Schedule: Every day at 9 AM
cron.schedule("0 9 * * *", () => {
  console.log(`🔁 [${timestamp()}] Starting daily-scan.ts...`);

  exec(`npx ts-node ${scanScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ [${timestamp()}] Execution Error:\n${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ [${timestamp()}] stderr:\n${stderr}`);
    }

    console.log(`✅ [${timestamp()}] Scan Complete:\n${stdout}`);
  });
});

