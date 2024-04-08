import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function upgrade() {

    const stableSwapFactory = await ethers.getContractFactory("StableSwapFactory");
    const stableSwapFactoryContract = await upgrades.upgradeProxy(
        process.env.STABLE_SWAP_FACTORY!,
        stableSwapFactory
      );
    
    console.log("Stable swap factory is upgraded sucess: ", stableSwapFactoryContract.address);
    
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