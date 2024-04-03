import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../scripts/utils/helper";

dotenv.config();

async function deploy() {

    const stableSwapLPFactory = await ethers.getContractFactory("StableSwapLPFactory");
    const stableSwapLPFactoryContract = await upgrades.deployProxy(stableSwapLPFactory);
    await stableSwapLPFactoryContract.deployed();
    
    console.log("LP factory deploy at: ", stableSwapLPFactoryContract.address);

    writeToEnvFile("STABLE_SWAP_LP_FACTORY", stableSwapLPFactoryContract.address);
    console.log("Success deploy");
}

async function setUp() {
    var LP_factory = await ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
    var stable_swap_factory_address = process.env.STABLE_SWAP_FACTORY!;

    var tx = await LP_factory.transferOwnership(stable_swap_factory_address);
    console.log("transferOwnership success!", tx.hash);
}


async function main() {
    await deploy();
    // await setUp();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });