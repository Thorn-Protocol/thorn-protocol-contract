import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function upgrade() {

    const stableSwapLPFactory = await ethers.getContractFactory("StableSwapLPFactory");
    const stableSwapLPFactoryContract = await upgrades.upgradeProxy(
        process.env.STABLE_SWAP_LP_FACTORY!,
        stableSwapLPFactory
      );
    
    console.log("Stable swap LP factory is upgraded sucess: ", stableSwapLPFactoryContract.address);
    
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