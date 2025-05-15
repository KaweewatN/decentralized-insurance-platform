import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";

const accounts =
  process.env.SEPOLIA_PRIVATE_KEY &&
  process.env.SEPOLIA_PRIVATE_KEY.length === 64
    ? [process.env.SEPOLIA_PRIVATE_KEY]
    : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  paths: {
    sources: "./contracts",
  },

  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC || "",
      accounts,
    },
  },

  typechain: {
    outDir: "../contracts/typechain-types",
    target: "ethers-v6",
  },
};

export default config;
