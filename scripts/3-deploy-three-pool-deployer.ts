import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../scripts/utils/helper";

dotenv.config();

async function deploy() {

    const stableSwapThreePoolDeployerFactory = await ethers.getContractFactory("StableSwapThreePoolDeployer");
    const stableSwapThreePoolDeployerContract = await upgrades.deployProxy(stableSwapThreePoolDeployerFactory);
    await stableSwapThreePoolDeployerContract.deployed();
    
    console.log("Three pool deployer deploy at: ", stableSwapThreePoolDeployerContract.address);

    writeToEnvFile("STABLE_SWAP_THREE_POOL_DEPLOYER", stableSwapThreePoolDeployerContract.address);
    console.log("Success deploy");
}

async function setUp() {
    var three_pool_deployer = await ethers.getContractAt("StableSwapThreePoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
    var stable_swap_factory_address = process.env.STABLE_SWAP_FACTORY!;

    var tx = await three_pool_deployer.transferOwnership(stable_swap_factory_address);
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