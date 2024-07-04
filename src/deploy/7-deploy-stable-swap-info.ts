import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../utils/helper";
dotenv.config();

async function deploy() {
    
    const stableSwapInfoFactory = await ethers.getContractFactory("StableSwapInfo");
    const stableSwapInfoContract = await stableSwapInfoFactory.deploy(
      process.env.STABLE_SWAP_TWO_POOL_INFO,
      process.env.STABLE_SWAP_THREE_POOL_INFO
    );
    await stableSwapInfoContract.deployed();
    
    console.log("Stable swap info deploy at: ", stableSwapInfoContract.address);
    
    writeToEnvFile("STABLE_SWAP_INFO", stableSwapInfoContract.address);
    
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