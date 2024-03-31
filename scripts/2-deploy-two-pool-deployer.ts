import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../scripts/utils/helper";

dotenv.config();

async function deploy() {

    const stableSwapTwoPoolDeployerFactory = await ethers.getContractFactory("StableSwapTwoPoolDeployer");
    const stableSwapTwoPoolDeployerContract = await upgrades.deployProxy(stableSwapTwoPoolDeployerFactory);
    await stableSwapTwoPoolDeployerContract.deployed();
    
    console.log("Two pool deployer deploy at: ", stableSwapTwoPoolDeployerContract.address);

    writeToEnvFile("STABLE_SWAP_TWO_POOL_DEPLOYER", stableSwapTwoPoolDeployerContract.address);
    console.log("Success deploy");
}

async function setUp() {
    var two_pool_deployer = await ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
    var stable_swap_factory_address = process.env.STABLE_SWAP_FACTORY!;

    var tx = await two_pool_deployer.transferOwnership(stable_swap_factory_address);
    console.log("transferOwnership success!", tx.transactionHash);
}


async function main() {
    // await deploy();
    // await setUp();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });