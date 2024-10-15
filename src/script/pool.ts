import hre from "hardhat";
import { ERC20__factory, StableSwapFactory__factory, StableSwapTwoPool__factory } from "../../typechain-types";
import { TOKEN_TESTNET } from "../config";
import { plainPools } from "../../typechain-types/contracts/stableSwap";
import { parseEther } from "ethers";

async function pool() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    // const data = await read("pool_ROSE-stROSE", "support_ROSE");
    // console.log(" data ", data);
    const stROSE = ERC20__factory.connect(TOKEN_TESTNET.stROSE, hre.ethers.provider);

    const poolAddress = (await get("pool_ROSE-stROSE")).address;

    const pool = StableSwapTwoPool__factory.connect(poolAddress, hre.ethers.provider);

    const balance = await stROSE.balanceOf(deployer);

    let txRespone, txReceipt;

    const tokenLPAddress = await pool.token();

    const tokenLP = ERC20__factory.connect(tokenLPAddress, hre.ethers.provider);

    const balanceLP = await tokenLP.balanceOf(deployer);

    console.log("balanceLP", balanceLP.toString());

    // if (balance > parseEther("1")) {
    //     await stROSE.connect(deployer2).approve(poolAddress, parseEther("1"));
    //     console.log(" add_liquidity ");
    //     txRespone = await pool
    //         .connect(deployer2)
    //         .add_liquidity([parseEther("1"), parseEther("1")], 0, { value: parseEther("1") });
    //     await txRespone.wait();
    // }
}

pool();
