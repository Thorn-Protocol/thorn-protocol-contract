import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();


async function addLiquidity(){
    const depositMeta=await ethers.getContractAt("DepositMeta",process.env.DEPOSIT_META);
    const tokenA =await ethers.getContractAt("ERC20", process.env.TOKEN_A);
    const tokenB= await ethers.getContractAt("ERC20", process.env.TOKEN_B);
    const tokenC= await ethers.getContractAt("ERC20", process.env.TOKEN_C);
    const tokenD= await ethers.getContractAt("ERC20", process.env.TOKEN_D);

    let tx=await tokenA.approve(process.env.DEPOSIT_META,1e8)
    await  tx.wait();
    let tx1=await tokenB.approve(process.env.DEPOSIT_META,1e8)
    await  tx1.wait();
    let tx2=await tokenC.approve(process.env.DEPOSIT_META,1e8)
    await  tx2.wait();
    let tx3=await tokenC.approve(process.env.DEPOSIT_META,1e8)
    await  tx3.wait();
    let tx4=await depositMeta.add_liquidity([1e8,1e8,1e8,1e8],0);
    await tx4.wait();
}

async function removeLiquidity(){
    const depositMeta=await ethers.getContractAt("DepositMeta",process.env.DEPOSIT_META);
    let tx=await depositMeta.remove_liquidity(1e8,[0,0,0,0]);
    await tx.wait();
    console.log(tx);

}

async function removeLiquidityOneCoin(){
    const depositMeta=await ethers.getContractAt("DepositMeta",process.env.DEPOSIT_META);
    // parameter:  uint256 _token_amount, uint256 position, uint256 _min_amount
    let tx=await depositMeta.remove_liquidity_one_coin(1e8,0,0); 
    await tx.wait();
    console.log(tx);
}

async function calcWidthdrawOneCoin(){
    const depositMeta=await ethers.getContractAt("DepositMeta",process.env.DEPOSIT_META);
    // parameter:  uint256 _token_amount, uint256 position
    let tx=await depositMeta.calc_withdraw_one_coin(1e8,0);
    console.log(tx);

}
async function calc_token_amount(){
    const depositMeta=await ethers.getContractAt("DepositMeta",process.env.DEPOSIT_META);
    // parameter:  uint256 _token_amount, uint256 position
    let tx=await depositMeta.calc_token_amount([1e8,1e8,1e8,1e8],"True");
    console.log(tx);
}