import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: "crane walnut tent lawsuit strike other again raw raise strike long tuna",
      },
      chainId: 1337,
    },
  },
};

export default config;
