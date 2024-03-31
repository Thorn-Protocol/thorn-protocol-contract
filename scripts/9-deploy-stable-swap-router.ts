import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../scripts/utils/helper";

dotenv.config();

async function deploy() {

    const StableSwapRouterFactory = await ethers.getContractFactory("StableSwapRouter",{
    libraries:{
        SmartRouterHelper: process.env.SMART_ROUTER_HELPER_LIBRARY,
    }
    });
    const StableSwapRouterContract =await upgrades.deployProxy(
        StableSwapRouterFactory, 
        [process.env.STABLE_SWAP_FACTORY,process.env.STABLE_SWAP_INFO]
    );
    await StableSwapRouterContract.deployed();
    
    console.log("Stable swap router deploy at: ", StableSwapRouterContract.address);

    writeToEnvFile("STABLE_SWAP_ROUTER", StableSwapRouterContract.address);
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