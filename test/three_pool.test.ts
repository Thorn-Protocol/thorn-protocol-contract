import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory } from "../typechain-types";
dotenv.config();

describe("StableSwapFactory Contract Tests", function () {
    let factory: StableSwapFactory;
    let tokenA: ERC20;
    let tokenB: ERC20;
    let tokenC: ERC20;

    before(async function () {
        factory = await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY!);
        tokenA = await ethers.getContractAt("ERC20", process.env.TOKEN_A!);
        tokenB = await ethers.getContractAt("ERC20", process.env.TOKEN_B!);
        tokenC = await ethers.getContractAt("ERC20", process.env.TOKEN_C!);
    });

    // it("should transfer ownership", async function () {
    //     // const StableSwapLPFactory =await  ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
    //     // const StableSwapTwoPoolDeployer =await  ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
    //     const StableSwapThreePoolDeployer =await  ethers.getContractAt("StableSwapThreePoolDeployer", process.env.STABLE_SWAP_THREE_POOL_DEPLOYER!);
    //     let tx = await StableSwapThreePoolDeployer.transferOwnership(process.env.STABLE_SWAP_FACTORY);
    //     await tx.wait();
    //     console.log(tx);
    // });

    // it("should create 3pool pair", async function () {
    //     const tx =await  factory.createThreePoolPair(
    //         process.env.TOKEN_A,
    //         process.env.TOKEN_B,
    //         process.env.TOKEN_C,
    //         1000,
    //         4000000,
    //         5000000000
    //     )
    //     await tx.wait();
    //     console.log(tx);
    // });

    // it("should retrieve 3pool pair information", async function () {
    //     const pair= await factory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    //     console.log(pair);
    // });

    // it("should add liquidity to 3pool", async function () {
    //     const threePairInfo = await factory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B);
    //     const StableSwapThreePool = await  ethers.getContractAt("StableSwapThreePool", threePairInfo[0]);

    //     // console.log(await tokenA.balanceOf(process.env.PUBLIC_KEY));
    //     // console.log(await tokenB.balanceOf(process.env.PUBLIC_KEY));
    //     // console.log(await tokenC.balanceOf(process.env.PUBLIC_KEY));

    //     let tx=await tokenA.approve(threePairInfo[0],1e8)
    //     await  tx.wait();
    //     let tx1=await tokenB.approve(threePairInfo[0],1e8)
    //     await  tx1.wait();
    //     let tx2=await tokenC.approve(threePairInfo[0],1e8)
    //     await  tx2.wait();

    //     const tx3=await StableSwapThreePool.add_liquidity([1e8, 1e8, 1e8], 0)
    //     await tx3.wait();
    //     console.log(tx3);
    // });

    // it("should perform token exchange in 3pool", async function () {
    //     const threePairInfo = await factory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
    //     const StableSwapThreePool=await  ethers.getContractAt("StableSwapThreePool", threePairInfo[0]);

    //     let tx=await tokenC.approve(threePairInfo[0],1e3)
    //     await  tx.wait();
    
    //     const tx1=await StableSwapThreePool.exchange(0,1,1e3,0)
    //     await tx1.wait();
    //     console.log(tx1);
    // });

    // it("should retrieve balances for 3pool", async function () {
    //     const threePairInfo = await factory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B);
    //     const StableSwapThreePoolInfo =await  ethers.getContractAt("StableSwapThreePoolInfo", process.env.STABLE_SWAP_THREE_POOL_INFO);
    //     let tx = await StableSwapThreePoolInfo.balances(threePairInfo[0]);
    //     console.log(tx);
    // });

    it("should remove liquidity from 3pool", async function () {
        const threePairInfo = await factory.getThreePoolPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
        const StableSwapThreePool=await  ethers.getContractAt("StableSwapThreePool", threePairInfo[0]);
        // const lptoken = await ethers.getContractAt("ERC20", threePairInfo[4]);
        // console.log(await lptoken.balanceOf(process.env.PUBLIC_KEY));
        const pair=await StableSwapThreePool.remove_liquidity(1e6, [0,0,0]);
        await pair.wait();
        console.log(pair);
    });

});
