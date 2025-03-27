import { HardhatRuntimeEnvironment } from "hardhat/types";
import hre from "hardhat";
import { StableSwapFactory__factory } from "../../../typechain-types";
import { Wallet } from "ethers";

async function changeAdmin() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const factory = StableSwapFactory__factory.connect((await get("StableSwapFactory")).address, hre.ethers.provider);

    const admin = await factory.admin();
    console.log("admin", admin);

    console.log("deployer", deployer);
}

changeAdmin();
