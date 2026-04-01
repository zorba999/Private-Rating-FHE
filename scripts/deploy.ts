import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const serviceName = process.env.SERVICE_NAME || "My Service";

  const PrivateRating = await ethers.getContractFactory("PrivateRating");
  const contract = await PrivateRating.deploy(serviceName);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PrivateRating deployed to:", address);
  console.log(`\nAdd to your .env.local:\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
