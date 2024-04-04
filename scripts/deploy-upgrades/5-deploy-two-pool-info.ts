import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../utils/helper";
dotenv.config();

async function deploy() {
    
    const stableSwapTwoPoolInfoFactory = await ethers.getContractFactory("StableSwapTwoPoolInfo");
    const stableSwapTwoPoolInfoContract = await stableSwapTwoPoolInfoFactory.deploy();
    await stableSwapTwoPoolInfoContract.deployed();
    
    console.log("Stable swap two pool info deploy at: ", stableSwapTwoPoolInfoContract.address);
    
    writeToEnvFile("STABLE_SWAP_TWO_POOL_INFO", stableSwapTwoPoolInfoContract.address);
    
    console.log("Success deploy");
}

async function main() {
    await deploy();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });