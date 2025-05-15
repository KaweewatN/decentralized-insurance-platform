// fixedSignatureGenerator.js
// ปรับปรุงให้ตรงกับวิธีการทำงานจริงของ signature.utils.ts
const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function generateCorrectSignature() {
  // 1. กำหนดข้อมูลที่จะใช้ทดสอบ
  const age = 35;
  const gender = "male";
  const occupation = "software engineer";
  const sumAssured = 1000000;
  const premiumInThb = 7500;

  try {
    // 2. โหลด private key สำหรับ admin
    const adminKey = process.env.ADMIN_PRIVATE_KEY || 'daee72147f7914d7337682fc9c7fc305ebe92d6bae467d5f07de4765d830e8d6';
    if (!adminKey) {
      throw new Error("ADMIN_PRIVATE_KEY not set in the environment");
    }

    const wallet = new ethers.Wallet(adminKey);
    console.log("👤 Admin address:", wallet.address);

    // 3. จัดรูปแบบ premium ให้เป็น 6 ตำแหน่งทศนิยม
    const formattedPremium = Number(premiumInThb).toFixed(6);
    
    // 4. สร้างข้อความ (message)
    const message = `${age},${gender},${occupation},${sumAssured},${formattedPremium}`;
    console.log("\n📝 Message string:", message);
    
    // 5. สร้าง message hash ด้วย keccak256 (สำคัญมาก: ตรงกับ hashMessage ใน backend)
    const messageHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
    console.log("🔑 Message hash:", messageHash);

    // 6. สร้าง signature โดยเซ็น messageHash (ไม่ใช่ message ธรรมดา)
    // ตรงกับวิธีใน generateSignature ของ backend
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    console.log("✅ Generated signature:", signature);

    // 7. ทดสอบการตรวจสอบ signature แบบเดียวกับ backend
    console.log("\n🔍 ทดสอบการตรวจสอบแบบเดียวกับ backend:");
    try {
      const recoveredAddress = ethers.utils.verifyMessage(
        ethers.utils.arrayify(messageHash),
        signature
      );
      console.log("Recovered address:", recoveredAddress);
      console.log("Admin address:", wallet.address);
      console.log("Valid signature:", recoveredAddress.toLowerCase() === wallet.address.toLowerCase());
    } catch (error) {
      console.error("❌ Error during verification:", error.message);
    }

    // 8. เตรียม JSON payload สำหรับทดสอบใน Postman หรือ cURL
    const payload = {
      age,
      gender,
      occupation,
      sumAssured,
      signature
    };

    console.log("\n📦 Ready-to-use JSON for API testing:");
    console.log(JSON.stringify(payload, null, 2));

    // 9. สร้าง cURL command สำหรับทดสอบ API
    const curlCommand = `curl -X POST http://localhost:3000/life-care-lite/calculate-premium \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload)}'`;

    console.log("\n🚀 cURL command for testing:");
    console.log(curlCommand);
    
    // 10. คำแนะนำเพิ่มเติมเกี่ยวกับ ADMIN_PUBLIC_KEY
    console.log("\n⚠️ สำคัญ: ตรวจสอบ ADMIN_PUBLIC_KEY ใน backend");
    console.log(`ค่า ADMIN_PUBLIC_KEY ต้องตรงกับ address ของ wallet (${wallet.address})`);
    console.log("วิธีแก้: ตั้งค่า env variable ADMIN_PUBLIC_KEY หรือแก้ไขค่า default ในไฟล์ signature.utils.ts");
    
  } catch (error) {
    console.error("❌ Error generating signature:", error.message);
  }
}

// รันฟังก์ชัน
generateCorrectSignature().catch(console.error);