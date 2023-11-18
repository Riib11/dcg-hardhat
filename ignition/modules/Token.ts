import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export default buildModule("Token", (m) => {
  const token = m.contract("Token",
    [],
    {}
  );

  return { token };
});
