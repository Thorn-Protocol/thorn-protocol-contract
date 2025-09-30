import hre, { ethers } from "hardhat";
import { StableSwapFactory__factory, StableSwapThreePoolV2__factory, StableSwapTwoPool__factory } from "../../../typechain-types";

async function main() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    console.log("deployer", deployer);

    const rose_strose_pool = StableSwapThreePoolV2__factory.connect((await get("pool_ROSE-stROSE")).address, hre.ethers.provider);
    const owner = await rose_strose_pool.owner();
    let fee_0 = await rose_strose_pool.admin_balances(0);
    let fee_1 = await rose_strose_pool.admin_balances(1);

    console.log("owner", owner);
    console.log("fee_0", ethers.formatEther(fee_0.toString()));
    console.log("fee_1", ethers.formatEther(fee_1.toString()));

    const bitUSDs_usdce_pool = StableSwapThreePoolV2__factory.connect((await get("pool_bitUSDs-USDCe")).address, hre.ethers.provider);
    const bitUSDs_usdce_pool_owner = await bitUSDs_usdce_pool.owner();
    console.log("owner_bitUSDs_usdce_pool", bitUSDs_usdce_pool_owner);
    let fee_0_bitUSDs_usdce_pool = await bitUSDs_usdce_pool.admin_balances(0);
    let fee_1_bitUSDs_usdce_pool = await bitUSDs_usdce_pool.admin_balances(1);
    console.log("fee_0_bitUSDs_usdce_pool", ethers.formatUnits(fee_0_bitUSDs_usdce_pool.toString(), 6));
    console.log("fee_1_bitUSDs_usdce_pool", ethers.formatUnits(fee_1_bitUSDs_usdce_pool.toString(), 18));

    const bitUSDs_usdt_pool = StableSwapThreePoolV2__factory.connect((await get("pool_bitUSDs-USDT")).address, hre.ethers.provider);
    const owner_bitUSDs_usdt_pool = await bitUSDs_usdt_pool.owner();
    console.log("owner_bitUSDs_usdt_pool", owner_bitUSDs_usdt_pool);
    let fee_0_bitUSDs_usdt_pool = await bitUSDs_usdt_pool.admin_balances(0);
    let fee_1_bitUSDs_usdt_pool = await bitUSDs_usdt_pool.admin_balances(1);
    console.log("fee_0_bitUSDs_usdt_pool", ethers.formatUnits(fee_0_bitUSDs_usdt_pool.toString(), 6));
    console.log("fee_1_bitUSDs_usdt_pool", ethers.formatUnits(fee_1_bitUSDs_usdt_pool.toString(), 18));

    const factory = StableSwapFactory__factory.connect((await get("StableSwapFactory")).address, hre.ethers.provider);
    const admin = await factory.admin();
    console.log("admin", admin);
}

main();
