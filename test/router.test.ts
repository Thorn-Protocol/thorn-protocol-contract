import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// async function exactInputStableSwap(addresses:Array<String>,flag:Array<number>,amountIn:bigint,amountOutMin:bigint,to:String)  {
async function exactInputStableSwap() {
    const contract=await ethers.getContractAt("StableSwapRouter",process.env.STABLE_SWAP_ROUTER);
    const tokenA=await ethers.getContractAt("ERC20",process.env.TOKEN_A);
    let tx=await tokenA.approve(process.env.STABLE_SWAP_ROUTER,100000000000000n);
    const tx1= await contract.exactInputStableSwap([process.env.TOKEN_A,process.env.TOKEN_C],[2],100000000000000n,0,"0xa4F816D2f1801051484AeF1fD8e1e4e59C6Bf76F");
    await tx1.wait();
    console.log(tx1);
}

async function get_balances(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    const factory=await  ethers.getContractAt("StableSwapTwoPoolInfo", process.env.STABLE_SWAP_TWO_POOL_INFO);
    let tx = await factory.balances(pairInfo[0]);
    console.log(tx);
}

async function exactOutputStableSwap(addresses:Array<String>,flag:Array<number>,amountIn:bigint,amountOutMin:bigint,to:String){
    const contract=await ethers.getContractAt("StableSwapRouter",process.env.STABLE_SWAP_ROUTER);
    const tokenA=await ethers.getContractAt("ERC20",process.env.TOKEN_A);
    let tx=await tokenA.approve(process.env.STABLE_SWAP_ROUTER,amountIn);
    await tx.wait();
    const tx1= await contract.exactOutputStableSwap(addresses,flag,amountIn,amountOutMin,process.env.PUBLIC_KEY);
    await tx1.wait();
    console.log(tx1);
}

get_balances()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});