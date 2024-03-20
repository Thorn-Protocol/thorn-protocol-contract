import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { loadingButtonClasses } from "@mui/lab";
dotenv.config();



async function addLiquidity(){
    const swapMeta=await ethers.getContractAt("SwapMeta",process.env.SWAP_META);
    console.log(swapMeta);

    let tx = await swapMeta.A();
    console.log(tx);
    
    
    // const stbToken =await ethers.getContractAt("ERC20", process.env.STB_TOKEN);
    // const lpToken = await ethers.getContractAt("ERC20", process.env.LP_TOKEN);

    // let tx=await stbToken.approve(process.env.SWAP_META,1000000000000000000n)
    // await  tx.wait();
    // let tx1=await lpToken.approve(process.env.SWAP_META,1000000000000000000n)
    // await  tx1.wait();

    // let tx2=await swapMeta.add_liquidity([1000000000000000000n,1000000000000000000n],0);
    // await tx2.wait();
    // console.log(tx2);
}

async function exchange(){
    const swapMeta=await ethers.getContractAt("SwapMeta",process.env.SWAP_META);
    const stbToken =await ethers.getContractAt("ERC20", process.env.STB_TOKEN);
    let tx= await stbToken.approve(process.env.SWAP_META,1e14)
    await tx.wait();
    const tx1=await swapMeta.exchange(0,1,1e14,0)
    await tx1.wait();
    console.log(tx1);
}

async function exchange_underlying(){
    const swapMeta=await ethers.getContractAt("SwapMeta",process.env.SWAP_META);
    const stbToken =await ethers.getContractAt("ERC20", process.env.STB_TOKEN);
    let tx= await stbToken.approve(process.env.SWAP_META,1e14)
    await tx.wait();
    const tx1=await swapMeta.exchange(0,1,1e14,0)
    await tx1.wait();
    console.log(tx1);
}

async function remove_liquidity(){
    const swapMeta=await ethers.getContractAt("SwapMeta",process.env.SWAP_META);
    // const token = await ethers.getContractAt("ERC20", process.env.POOL_TOKEN);
    // console.log(await token.balanceOf("process.env.PUBLIC_KEY"));
    const tx=await swapMeta.remove_liquidity(2000000000000000000n, [0,0]);
    await tx.wait();
    console.log(tx);
}

async function get_balances(){
    const swapMeta = await ethers.getContractAt("SwapMeta",process.env.SWAP_META);
    const basePool = await ethers.getContractAt("StableSwapThreePoolInfo",process.env.STABLE_SWAP_THREE_POOL_INFO)
    
    // let tx1 = await basePool.balances(process.env.BASE_POOL);
    // console.log(tx1);
}

addLiquidity().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});