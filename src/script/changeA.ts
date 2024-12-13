import { StableSwapTwoPool__factory } from "./../../typechain-types/factories/contracts/stableSwap/plain-pools/StableSwapTwoPool__factory";
import hre from "hardhat";

async function change_A() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);
    const poolDeployment = await get("pool_ROSE-stROSE");

    const pool = StableSwapTwoPool__factory.connect(poolDeployment.address, hre.ethers.provider);

    const initial_A = await pool.A();
    const future_A = await pool.future_A();
    console.log("initial_A", initial_A);
    console.log("future_A", future_A);

    const time = Math.round(Date.now() / 1000) + 60 * 60 * (24 + 12);

    const tx_non_sign = await pool.ramp_A.populateTransaction(future_A, time);
    const owner = await pool.owner();

    console.log("tx_non_sign", tx_non_sign);

    console.log("deployer", deployer);

    const target = 250n;

    // if (target < future_A) {
    //     await pool.connect(deployer2).ramp_A(target, time);
    // }
    //const staticx = await pool.ramp_A.staticCall(future_A, time, { from: owner });
    //console.log("staticx", staticx);
}

change_A();
