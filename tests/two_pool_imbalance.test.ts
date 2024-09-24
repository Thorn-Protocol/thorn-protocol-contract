import { ethers, upgrades,deployments} from "hardhat";
import * as hre from "hardhat";
import { expect, assert } from "chai";
import * as dotenv from "dotenv";
import { BigNumber, Contract} from "ethers";
import { getOption, writeToEnvFile } from "../src/utils/helper";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { StableSwapLP, StableSwapTwoPool, Token } from "../typechain-types";
dotenv.config();

describe("Two pool imbalance",function(){
    this.timeout(15000000);
    let pool:StableSwapTwoPool;
    let poolLP: StableSwapLP;
    let tokenA: Token;
    let tokenB: Token;
    let alice:SignerWithAddress;
    let bob: SignerWithAddress;
    let charle: SignerWithAddress;
    let amountA=ethers.utils.parseUnits('100',18);
    let amountB=ethers.utils.parseUnits('100000',18);
    let amountC=ethers.utils.parseUnits('1000000000',18);
    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;
    before(async function(){
        [alice,bob,charle]=await ethers.getSigners();
        let users=[alice,bob,charle];
        tokenA=await (await hre.ethers.getContractFactory("Token")).deploy("tokenA","A",18) as unknown as Token;
        tokenB=await (await hre.ethers.getContractFactory("Token")).deploy("tokenB","B",18)  as unknown as Token;
        poolLP=await (await hre.ethers.getContractFactory("StableSwapLP")).deploy() as unknown as StableSwapLP;
        const pool_fc=await hre.ethers.getContractFactory("StableSwapTwoPool");
        pool=(await pool_fc.deploy())  as unknown as  StableSwapTwoPool;
        await(await poolLP.setMinter(pool.address)).wait();
        
        await(await pool.initialize(
            [tokenA.address, tokenB.address], A, Fee, AdminFee,alice.address,poolLP.address)).wait();
    
        for(let user of users){
            await (await tokenA.mint(user.address,amountC)).wait();
            await (await tokenB.mint(user.address,amountC)).wait();
            await (await tokenA.connect(user).approve(pool.address,amountC)).wait();
            await (await tokenB.connect(user).approve(pool.address,amountC)).wait();
        }
    })
    it("add liquidity with imbalance amounts", async ()=>{
        let before_balance: BigNumber=ethers.BigNumber.from(await poolLP.balanceOf(alice.address));
        await( await pool.connect(alice).add_liquidity([amountA,amountB],0)).wait();
        let after_balance: BigNumber=ethers.BigNumber.from(await poolLP.balanceOf(alice.address));
        console.log(amountA.add(amountB));
        console.log(after_balance.sub(before_balance));
    })

    it("swap in imbalance pool",async()=>{
        let before_B=ethers.BigNumber.from(await tokenB.balanceOf(alice.address));
        await(await pool.exchange(0,1,ethers.utils.parseUnits('1',18),0)).wait();
        let  after_B=ethers.BigNumber.from(await tokenB.balanceOf(alice.address));
        console.log(after_B.sub(before_B));
        let before_A=ethers.BigNumber.from(await tokenA.balanceOf(alice.address));
        await(await pool.exchange(1,0,ethers.utils.parseUnits('1',18),0)).wait();
        let after_A=ethers.BigNumber.from(await tokenA.balanceOf(alice.address));
        console.log(after_A.sub(before_A));
        
    })
    

    it("add liquidity in imbalance pool",async()=>{
        let before_balance: BigNumber=ethers.BigNumber.from((await poolLP.balanceOf(charle.address)));
        let before_A_balance=ethers.BigNumber.from((await tokenA.balanceOf(charle.address)));
        let before_B_balance=ethers.BigNumber.from((await tokenB.balanceOf(charle.address)));

        await( await pool.connect(charle).add_liquidity([amountB,amountB],0)).wait();

        let after_balance: BigNumber=ethers.BigNumber.from((await poolLP.balanceOf(charle.address)));
        let after_A_balance=ethers.BigNumber.from((await tokenA.balanceOf(charle.address)));
        let after_B_balance=ethers.BigNumber.from((await tokenB.balanceOf(charle.address)));
        console.log(after_balance);

        await(await pool.connect(charle).remove_liquidity(after_balance,[0,0])).wait();

        let after_A_bal_1=ethers.BigNumber.from((await tokenA.balanceOf(charle.address)));
        let after_B_bal_1=ethers.BigNumber.from((await tokenB.balanceOf(charle.address)));
        let  amount_A=after_A_bal_1.sub(before_A_balance);
        let  amount_B=after_B_bal_1.sub(before_B_balance);
        console.log("remain");
        console.log(amount_A.add(amount_B).sub(amountA).sub(amountA));
        

        
    })
})