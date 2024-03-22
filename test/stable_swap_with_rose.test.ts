import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory } from "../typechain-types";
dotenv.config();

const ROSEAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

describe("StableSwapFactory Contract Tests", function () {
    let factory: StableSwapFactory;
    let tokenA: ERC20;
    let tokenB: ERC20;

    before(async function () {
        factory = await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY!);
        tokenA = await ethers.getContractAt("ERC20", ROSEAddress);
        tokenB = await ethers.getContractAt("ERC20", process.env.WROSE!);
    });

    it("should transfer ownership", async function () {
        // const StableSwapLPFactory =await  ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
        // const StableSwapTwoPoolDeployer =await  ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
        const StableSwapThreePoolDeployer =await  ethers.getContractAt("StableSwapThreePoolDeployer", process.env.STABLE_SWAP_THREE_POOL_DEPLOYER!);
        let tx = await StableSwapThreePoolDeployer.transferOwnership(process.env.STABLE_SWAP_FACTORY);
        await tx.wait();
        console.log(tx);
    });

    it("should create pair", async function () {
        const tx=await factory.createSwapPair(
            ROSEAddress,
            process.env.WROSE,
            200,
            4000000,
            5000000000
        )
        await tx.wait();
        console.log(tx);
    });

    it("should retrieve pair information", async function () {
        const pair= await factory.getPairInfo(ROSEAddress, process.env.WROSE)
        console.log(pair);
    });

    it("should add liquidity", async function () {
        const pairInfo = await factory.getPairInfo(ROSEAddress, process.env.WROSE)
        const StableSwapTwoPool = await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
        
        let tx=await tokenA.approve(pairInfo[0],1e8)
        await  tx.wait();
        let tx1=await tokenB.approve(pairInfo[0],1e8)
        await  tx1.wait();
    
        const tx2=await StableSwapTwoPool.add_liquidity([1e8, 1e8], 2e8)
        await tx2.wait();
        console.log(tx2);
    });

    it("should perform token exchange", async function () {
        const pairInfo = await factory.getPairInfo(ROSEAddress, process.env.WROSE)
        const StableSwapTwoPool =await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
        
        let tx=await tokenA.approve(pairInfo[0],1e8)
        await  tx.wait();

        const tx1=await StableSwapTwoPool.exchange(0,1,1e5,0)
        await tx1.wait();
        console.log(tx1);
    });
});
