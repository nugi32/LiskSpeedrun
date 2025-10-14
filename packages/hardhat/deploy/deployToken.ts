import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("===========================================");
  log("🚀 Starting deployment process...");
  log(`👷 Deployer account: ${deployer}`);
  log("===========================================");

  // === Deploy ERC20 Token ===
  const tokenDeployment = await deploy("MyToken", {
    from: deployer,
    args: [], // no constructor args
    log: true,
    autoMine: true, // speed up on local networks
  });

  log("✅ MyToken deployed at:", tokenDeployment.address);

  // === Deploy ERC721 NFT ===
  const nftDeployment = await deploy("MyNFT", {
    from: deployer,
    args: [], // no constructor args
    log: true,
    autoMine: true,
  });

  log("✅ MyNFT deployed at:", nftDeployment.address);
  log("===========================================");
  log("🎯 Deployment complete!");
  log("===========================================");
};

export default deployContracts;

// Tags help when you want to deploy specific contracts with yarn deploy --tags MyToken
deployContracts.tags = ["MyToken", "MyNFT"];
