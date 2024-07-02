import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../../scripts/utils/helper";

dotenv.config();

async function deploy() {

    const stableSwapFactory = await ethers.getContractFactory("StableSwapFactory");
    const stableSwapFactoryContract = await upgrades.deployProxy(
        stableSwapFactory,
        [process.env.STABLE_SWAP_LP_FACTORY,
        process.env.STABLE_SWAP_TWO_POOL_DEPLOYER,
        process.env.STABLE_SWAP_THREE_POOL_DEPLOYER],
        );
    await stableSwapFactoryContract.deployed();
    
    console.log("Stable swap factory deploy at: ", stableSwapFactoryContract.address);

    writeToEnvFile("STABLE_SWAP_FACTORY", stableSwapFactoryContract.address);
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