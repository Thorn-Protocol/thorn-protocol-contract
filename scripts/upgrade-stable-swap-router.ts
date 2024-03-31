import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function upgrade() {

    const StableSwapRouterFactory = await ethers.getContractFactory("StableSwapRouter",{
        libraries:{
            SmartRouterHelper: process.env.SMART_ROUTER_HELPER_LIBRARY,
        }
        });
    const StableSwapRouterContract = await upgrades.upgradeProxy(
        process.env.STABLE_SWAP_ROUTER!,
        StableSwapRouterFactory
      );
    
    console.log("Stable swap router is upgraded sucess: ", StableSwapRouterContract.address);
    
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