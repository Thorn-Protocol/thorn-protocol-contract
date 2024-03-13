import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const ROSEAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

async function transferOwnerShip(){
    // const factory =await  ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
    // const factory =await  ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
    const factory =await  ethers.getContractAt("StableSwapThreePoolDeployer", process.env.STABLE_SWAP_THREE_POOL_DEPLOYER);
    let tx = await factory.transferOwnership(process.env.STABLE_SWAP_FACTORY);
    await tx.wait();
    console.log(tx);
}

async function createPair(){
    const factory=await  ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY );
    const pair=await  factory.createSwapPair(
        ROSEAddress,
        process.env.WROSE,
        200,
        4000000,
        5000000000
    )
    await pair.wait();
    console.log(pair);

}
async function getPair(){
    const factory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pair= await factory.getPairInfo(ROSEAddress, process.env.WROSE)
    console.log(pair);

}

async function addLiquidity(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(ROSEAddress, process.env.WROSE)
    const factory=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    const tokenA =await ethers.getContractAt("ERC20", ROSEAddress);
    const tokenB= await ethers.getContractAt("ERC20", process.env.WROSE);
    let tx=await tokenA.approve(pairInfo[0],1e8)
    await  tx.wait();
    let tx1=await tokenB.approve(pairInfo[0],1e8)
    await  tx1.wait();

    const pair=await factory.add_liquidity([1e8, 1e8], 2e8)
    await pair.wait();
    console.log(pair);
}

async function exchange(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(ROSEAddress, process.env.WROSE)
    const factory=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    const tokenA =await ethers.getContractAt("ERC20", process.env.WROSE);
    let tx=await tokenA.approve(pairInfo[0],1e8)
    await  tx.wait();
    const pair=await factory.exchange(0,1,1e5,0)
    await pair.wait();
    console.log(pair);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
addLiquidity().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});