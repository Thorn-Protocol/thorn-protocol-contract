import { ethers, run, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../scripts/utils/helper";

dotenv.config();

async function deploy() {

    const SmartRouterHelperFactory=await ethers.getContractFactory("SmartRouterHelper");
    const SmartRouterHelperContract=await SmartRouterHelperFactory.deploy();
    await SmartRouterHelperContract.deployed();
    
    console.log("Smart router helper library deploy at: ", SmartRouterHelperContract.address);

    writeToEnvFile("SMART_ROUTER_HELPER_LIBRARY", SmartRouterHelperContract.address);
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