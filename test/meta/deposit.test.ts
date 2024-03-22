import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { DepositMeta, ERC20 } from "../../typechain-types";
import { StableSwapLP } from "../../typechain-types";
dotenv.config();

describe("DepositMeta Contract Tests", function () {
    let depositMeta: DepositMeta;
    let tokenA: ERC20;
    let tokenB: ERC20;
    let tokenC: ERC20;
    let stbToken: ERC20;
    let poolToken: StableSwapLP;

    before(async function () {
        depositMeta = await ethers.getContractAt("DepositMeta", process.env.DEPOSIT_META);
        tokenA = await ethers.getContractAt("ERC20", process.env.TOKEN_A);
        tokenB = await ethers.getContractAt("ERC20", process.env.TOKEN_B);
        tokenC = await ethers.getContractAt("ERC20", process.env.TOKEN_C);
        stbToken = await ethers.getContractAt("ERC20", process.env.STB_TOKEN);
        poolToken = await ethers.getContractAt("StableSwapLP", process.env.POOL_TOKEN);
    });

    // it("should add liquidity", async function () {
    //     let tx=await tokenA.approve(process.env.DEPOSIT_META,1e5)
    //     await  tx.wait();
    //     let tx1=await tokenB.approve(process.env.DEPOSIT_META,1e5)
    //     await  tx1.wait();
    //     let tx2=await tokenC.approve(process.env.DEPOSIT_META,1e5)
    //     await  tx2.wait();
    //     let tx3=await stbToken.approve(process.env.DEPOSIT_META,1e5)
    //     await  tx3.wait();
    //     let tx4=await depositMeta.add_liquidity([1e5,1e5,1e5,1e5],0);
    //     await tx4.wait();
    //     console.log(tx4);
    // });

    // it("should remove liquidity", async function () {
    // //    console.log(await poolToken.balanceOf(process.env.PUBLIC_KEY));
    //     let tx1=await poolToken.approve(process.env.DEPOSIT_META,1e5)
    //     await tx1.wait();

    //     let tx=await depositMeta.remove_liquidity(1e5,[0,0,0,0]);
    //     await tx.wait();
    //     console.log(tx);
    // });

    it("should remove liquidity for one coin", async function () {
        let tx1=await poolToken.approve(process.env.DEPOSIT_META,1e5)
        await tx1.wait();

        let tx=await depositMeta.remove_liquidity_one_coin(1e5,2,0); 
        await tx.wait();
        console.log(tx);
    });

    // it("should calculate withdrawable amount for one coin", async function () {
    //     let tx=await depositMeta.calc_withdraw_one_coin(1e8,0);
    //     console.log(tx);
    // });

    // it("should calculate token amount", async function () {
    //     let tx=await depositMeta.calc_token_amount([1e8,1e8,1e8,1e8],"True");
    //     console.log(tx);
    // });
});
