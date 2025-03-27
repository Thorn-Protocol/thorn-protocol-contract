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

    const adminTestnet = new Wallet(process.env.PRIVATE_KEY_ADMIN_SAPPHIRE_TESTNET!);

    const address = await adminTestnet.getAddress();
    console.log("address", address);

    const txPopulate = await factory.connect(adminTestnet).transferAdminship.populateTransaction(address);
    console.log("txPopulate", txPopulate);
}

changeAdmin();
