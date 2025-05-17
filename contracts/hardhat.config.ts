import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";



const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/a16d82cd9bed4ef3acfd09b03048f7e1", 
      accounts: ["f8e21cc5b3d7e5f0dbe6c04eae6b23c5a8d8923f4d77c384e5b3d2c47f8c65ab"] 
    }
  }
};

export default config;
