import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function upgrade() {

    const stableSwapTwoPoolDeployerFactory = await ethers.getContractFactory("StableSwapTwoPoolDeployer");
    const stableSwapTwoPoolDeployerContract = await upgrades.upgradeProxy(
        process.env.STABLE_SWAP_TWO_POOL_DEPLOYER!,
        stableSwapTwoPoolDeployerFactory
      );
    
    console.log("Stable swap two pool deployer is upgraded sucess: ", stableSwapTwoPoolDeployerContract.address);
    
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