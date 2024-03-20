import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function transferOwnerShip(){
     const factory =await  ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
    // const factory =await  ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
    // const factory =await  ethers.getContractAt("StableSwapThreePoolDeployer", process.env.STABLE_SWAP_THREE_POOL_DEPLOYER);
    // let tx = await factory.transferOwnership(process.env.STABLE_SWAP_FACTORY);
    // await tx.wait();
    // console.log(tx);
    console.log(await factory.owner());
    
}

async function createPair(){
    const factory=await  ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY );
    const pair=await  factory.createThreePoolPair(
        process.env.TOKEN_A,
        process.env.TOKEN_B,
        process.env.TOKEN_C,
        1000,
        4000000,
        5000000000
    )
    await pair.wait();
    console.log(pair);

}
async function getPair(){
    const factory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pair= await factory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    console.log(pair);
}

async function addLiquidity(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const threePairInfo = await StableSwapFactory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B);
    const factory=await  ethers.getContractAt("StableSwapThreePool", threePairInfo[0]);
    const tokenA =await ethers.getContractAt("ERC20", process.env.TOKEN_A);
    const tokenB= await ethers.getContractAt("ERC20", process.env.TOKEN_B);
    const tokenC= await ethers.getContractAt("ERC20", process.env.TOKEN_C);

    let tx=await tokenA.approve(threePairInfo[0],1e8)
    await  tx.wait();
    let tx1=await tokenB.approve(threePairInfo[0],1e8)
    await  tx1.wait();
    let tx2=await tokenC.approve(threePairInfo[0],1e8)
    await  tx2.wait();

    const pair=await factory.add_liquidity([1e8, 1e8, 1e8], 3e8)
    await pair.wait();
    console.log(pair);
}

async function exchange(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const threePairInfo = await StableSwapFactory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    const factory=await  ethers.getContractAt("StableSwapThreePool", threePairInfo[0]);
    const tokenC =await ethers.getContractAt("ERC20", process.env.TOKEN_C);
    let tx=await tokenC.approve(threePairInfo[0],1e8)
    await  tx.wait();
    //Swap token0 to token1 in triple pool
    const pair=await factory.exchange(0,1,3e4,0)
    await pair.wait();
    console.log(pair);
}

async function get_exchange_fee(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const threePairInfo = await StableSwapFactory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    const factory=await  ethers.getContractAt("StableSwapThreePoolInfo", process.env.STABLE_SWAP_THREE_POOL_INFO);
    let tx = await factory.get_exchange_fee(threePairInfo[0], 0, 1, 3e4);
    console.log(tx);
}

async function get_add_liquidity_fee(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const threePairInfo = await StableSwapFactory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    const factory=await  ethers.getContractAt("StableSwapThreePoolInfo", process.env.STABLE_SWAP_THREE_POOL_INFO);
    let tx = await factory.get_add_liquidity_fee(threePairInfo[0], [1e8, 1e8, 1e8]);
    console.log(tx);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getPair().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});