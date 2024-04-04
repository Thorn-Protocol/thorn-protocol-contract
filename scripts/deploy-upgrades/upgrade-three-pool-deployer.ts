import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function upgrade() {

    const stableSwapThreePoolDeployerFactory = await ethers.getContractFactory("StableSwapThreePoolDeployer");
    const stableSwapThreePoolDeployerContract = await upgrades.upgradeProxy(
        process.env.STABLE_SWAP_THREE_POOL_DEPLOYER!,
        stableSwapThreePoolDeployerFactory
      );
    
    console.log("Stable swap three pool deployer is upgraded sucess: ", stableSwapThreePoolDeployerContract.address);
    
}

async function main() {
    await upgrade();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });