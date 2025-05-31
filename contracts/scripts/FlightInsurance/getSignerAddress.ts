import { Wallet } from "ethers";

const pk = "f8e21cc5b3d7e5f0dbe6c04eae6b23c5a8d8923f4d77c384e5b3d2c47f8c65ab";
const wallet = new Wallet(pk);

console.log("Signer address:", wallet.address);
