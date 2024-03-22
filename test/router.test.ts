import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory, StableSwapRouter, StableSwapTwoPoolInfo } from "../typechain-types";
dotenv.config();

describe("StableSwapRouter Contract Tests", function () {
    let contract: StableSwapRouter;
    let tokenA: ERC20;
    let StableSwapFactory: StableSwapFactory;
    let factory: StableSwapTwoPoolInfo;

    before(async function () {
        contract = await ethers.getContractAt("StableSwapRouter", process.env.STABLE_SWAP_ROUTER);
        tokenA = await ethers.getContractAt("ERC20", process.env.TOKEN_A);
        StableSwapFactory = await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
        factory = await ethers.getContractAt("StableSwapTwoPoolInfo", process.env.STABLE_SWAP_TWO_POOL_INFO);
    });

    it("should perform exact input stable swap", async function () {
        let tx=await tokenA.approve(process.env.STABLE_SWAP_ROUTER,1e5);
        tx.wait();
        const tx1= await contract.exactInputStableSwap([process.env.TOKEN_A,process.env.TOKEN_C],[2],1e5,0,process.env.PUBLIC_KEY);
        await tx1.wait();
        console.log(tx1);
    });

    // it("should perform exact output stable swap", async function () {
    //     let tx=await tokenA.approve(process.env.STABLE_SWAP_ROUTER,100000000000000n);
    //     await tx.wait();
    //     const tx1= await contract.exactOutputStableSwap([process.env.TOKEN_A,process.env.TOKEN_C],[2],100000000000000n,0,process.env.PUBLIC_KEY);
    //     await tx1.wait();
    //     console.log(tx1);
    // });

    // it("should retrieve balances", async function () {
    //     const pairInfo = await StableSwapFactory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    //     let tx = await factory.balances(pairInfo[0]);
    //     console.log(tx);
    // });
});
