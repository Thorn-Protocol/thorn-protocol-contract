import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../scripts/utils/helper";
dotenv.config();

async function deploy() {
    
    const stableSwapThreePoolInfoFactory = await ethers.getContractFactory("StableSwapThreePoolInfo");
    const stableSwapThreePoolInfoContract = await stableSwapThreePoolInfoFactory.deploy();
    await stableSwapThreePoolInfoContract.deployed();
    
    console.log("Stable swap three pool info deploy at: ", stableSwapThreePoolInfoContract.address);
    
    writeToEnvFile("STABLE_SWAP_THREE_POOL_INFO", stableSwapThreePoolInfoContract.address);
    
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