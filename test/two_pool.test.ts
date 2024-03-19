import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function transferOwnerShip(){
    // const factory =await  ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
    const factory =await  ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
    // const factory =await  ethers.getContractAt("StableSwapThreePoolDeployer", process.env.STABLE_SWAP_THREE_POOL_DEPLOYER);
    let tx = await factory.transferOwnership(process.env.STABLE_SWAP_FACTORY);
    await tx.wait();
    console.log(tx);
}

async function createPair(){
    const factory=await  ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY );
    const pair=await  factory.createSwapPair(
        process.env.TOKEN_A,
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
    const pair= await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    console.log(pair);

}

async function addLiquidity(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    const factory=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    const tokenA =await ethers.getContractAt("ERC20", process.env.TOKEN_A);
    const tokenC= await ethers.getContractAt("ERC20", process.env.TOKEN_C);
//     console.log(await tokenA.balanceOf("0xa4F816D2f1801051484AeF1fD8e1e4e59C6Bf76F"));
//     console.log(await tokenC.balanceOf("0xa4F816D2f1801051484AeF1fD8e1e4e59C6Bf76F"));
//    console.log(await tokenA.decimals());
   
    let tx=await tokenA.approve(pairInfo[0],1000000000000000000n)
    await  tx.wait();
    let tx1=await tokenC.approve(pairInfo[0],1000000000000000000n)
    await  tx1.wait();

    const pair=await factory.add_liquidity([1000000000000000000n,1000000000000000000n], 0)
    await pair.wait();
    console.log(pair);
}

async function exchange(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    const factory=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    const tokenA =await ethers.getContractAt("ERC20", process.env.TOKEN_A);
    let tx=await tokenA.approve(pairInfo[0],100000000000000n)
    await  tx.wait();
    const pair=await factory.exchange(0,1,100000000000000n,0)
    await pair.wait();
    console.log(pair);
}

async function remove_liquidity(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    const factory=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    // const token = await ethers.getContractAt("ERC20", pairInfo[3]);
    // console.log(await token.balanceOf("0xa4F816D2f1801051484AeF1fD8e1e4e59C6Bf76F"));
    const pair=await factory.remove_liquidity(2000000000000000000n, [0,0]);
    await pair.wait();
    console.log(pair);
}

async function get_exchange_fee(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    const factory=await  ethers.getContractAt("StableSwapTwoPoolInfo", process.env.STABLE_SWAP_TWO_POOL_INFO);
    let tx = await factory.get_exchange_fee(pairInfo[0], 1, 0, 1e2);
    console.log(tx);
}

async function get_add_liquidity_fee(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    const factory=await  ethers.getContractAt("StableSwapTwoPoolInfo", process.env.STABLE_SWAP_TWO_POOL_INFO);
    let tx = await factory.get_add_liquidity_fee(pairInfo[0], [1e8, 1e8]);
    console.log(tx);
}

async function get_balances(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    const factory=await  ethers.getContractAt("StableSwapTwoPoolInfo", process.env.STABLE_SWAP_TWO_POOL_INFO);
    let tx = await factory.balances(pairInfo[0]);
    console.log(tx);
}

async function get_admin_balances(){
    const StableSwapFactory= await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
    const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    const factory= await ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    let tx = await factory.admin_balances(pairInfo[0]);
    console.log(tx);
}

async function getCoins(){
    const factory= await ethers.getContractAt("StableSwapTwoPool","0x9EAF48899C30920Ff15B6e231bAB56c0a019c33a");
    console.log(await factory.coins(0));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getCoins().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});