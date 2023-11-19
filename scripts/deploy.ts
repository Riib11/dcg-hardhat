import { artifacts, ethers } from "hardhat";
import * as path from "path";
import * as fs from "fs";

async function main() {
  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  // Dcg
  if (true) {
    console.log("deploying contract: Dcg")

    const dcg = await ethers.deployContract("Dcg", [], {});
    await dcg.waitForDeployment();

    const dcgAddress = await dcg.getAddress()

    // We also save the contract's artifacts and address in the frontend directory

    const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

    if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);

    fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify({ Dcg: dcgAddress }, undefined, 2)
    );

    const DcgArtifact = artifacts.readArtifactSync("Dcg");

    fs.writeFileSync(
      path.join(contractsDir, "Dcg.json"),
      JSON.stringify(DcgArtifact, null, 2)
    );
  }


  // Token
  if (false) {
    console.log("deploying contract: Token")

    const token = await ethers.deployContract("Token", [], {});
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress()

    // We also save the contract's artifacts and address in the frontend directory

    const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

    if (!fs.existsSync(contractsDir)) fs.mkdirSync(contractsDir);

    fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify({ Token: tokenAddress }, undefined, 2)
    );

    const TokenArtifact = artifacts.readArtifactSync("Token");

    fs.writeFileSync(
      path.join(contractsDir, "Token.json"),
      JSON.stringify(TokenArtifact, null, 2)
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
