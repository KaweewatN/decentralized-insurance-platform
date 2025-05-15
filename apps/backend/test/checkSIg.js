import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: '../.env' });
dotenv.config();

async function main() {
    // ✅ ตรวจสอบว่า ENV variable ไม่เป็น undefined
    const owner = process.env.ADMIN_PUBLIC_KEY || "";
    const privateKey = process.env.PRIVATE_KEY || "";
    const vaultAddress = process.env.VAULT_ADDRESS || "";
    const chainId = parseInt(process.env.CHAIN_ID || "11155111");

    if (!owner || !privateKey || !vaultAddress) {
        console.error("❌ ADMIN_PUBLIC_KEY, PRIVATE_KEY, หรือ VAULT_ADDRESS ไม่ได้ตั้งค่าใน .env");
        process.exit(1);
    }

    // 🔄 Smart Contract Parameters
    const premium = BigInt("200802163412286"); // Wei
    const sumAssured = BigInt("118118919654285698"); // Wei
    const duration = BigInt(31536000); // 1 year in seconds

    // ✅ สร้าง Wallet
    const wallet = new ethers.Wallet(privateKey);

    // ✅ Generate the exact same hash as smart contract
    const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [owner, premium, sumAssured, duration, BigInt(chainId)]
    );
    console.log(`Message Hash: ${messageHash}`);

    // ✅ Sign the message
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    console.log(`Signature: ${signature}`);

    // ✅ Verify the signature
    const recoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        signature
    );
    console.log(`Recovered Address: ${recoveredAddress}`);

    // ✅ Compare Addresses
    if (recoveredAddress.toLowerCase() === owner.toLowerCase()) {
        console.log("✅ Signature verification successful!");
    } else {
        console.error("❌ Signature verification failed!");
        console.error(`Expected: ${owner}`);
        console.error(`Recovered: ${recoveredAddress}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});