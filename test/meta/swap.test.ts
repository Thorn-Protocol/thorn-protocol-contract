import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { ERC20, StableSwapLP, SwapMeta } from "../../typechain-types";
dotenv.config();

describe("SwapMeta Contract Tests", function () {
    let swapMeta: SwapMeta;
    let stbToken: ERC20;
    let lpToken: ERC20;
    let poolToken: StableSwapLP;

    before(async function () {
        swapMeta = await ethers.getContractAt("SwapMeta", process.env.SWAP_META);
        stbToken = await ethers.getContractAt("ERC20", process.env.STB_TOKEN);
        lpToken = await ethers.getContractAt("ERC20", process.env.LP_TOKEN);
        poolToken = await ethers.getContractAt("StableSwapLP", process.env.POOL_TOKEN);
    });

    // it("should add liquidity", async function () {
    //     // console.log(await stbToken.balanceOf(process.env.PUBLIC_KEY));
    //     // console.log(await lpToken.balanceOf(process.env.PUBLIC_KEY));
        

    //     let tx = await poolToken.setMinter(process.env.SWAP_META);
    //     await tx.wait();
    
    //     let tx1 = await stbToken.approve(process.env.SWAP_META,1e6)
    //     await tx1.wait();
    //     let tx2 = await lpToken.approve(process.env.SWAP_META,1e6)
    //     await tx2.wait();
    
    //     let tx3 = await swapMeta.add_liquidity([1e6,1e6],0);
    //     await tx3.wait();
    //     console.log(tx3);  
    // });

    // it("should exchange tokens", async function () {
    //     let tx= await stbToken.approve(process.env.SWAP_META,1000)
    //     await tx.wait();

    //     let tx1=await swapMeta.exchange(0,1,1000,0)
    //     await tx1.wait();
    //     console.log(tx1);
    // });

    // it("should exchange underlying tokens", async function () {
    //     let tx= await stbToken.approve(process.env.SWAP_META, 100)
    //     await tx.wait();

    //     const tx1=await swapMeta.exchange_underlying(0,2,100,0)
    //     await tx1.wait();
    //     console.log(tx1);
    // });

    // it("should remove liquidity", async function () {

    //     // console.log(await poolToken.balanceOf(process.env.PUBLIC_KEY));
    //     let tx=await poolToken.approve(process.env.SWAP_META,1e6)
    //     await tx.wait();

    //     const tx1 =await swapMeta.remove_liquidity(1e6, [0,0]);
    //     await tx1.wait();
    //     console.log(tx1);
    // });

    it("should get balances", async function () {
        console.log(await swapMeta.balances(0));
        console.log(await swapMeta.balances(1));
        console.log(await poolToken.balanceOf(process.env.PUBLIC_KEY));
    });
});
