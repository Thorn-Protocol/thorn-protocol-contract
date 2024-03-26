
import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ERC20, PlainLendingPool, IStableSwapLP} from "../../typechain-types";

dotenv.config();

describe("Swap USDC Contract Tests",function(){

    let DAI :ERC20;
    let USDC: ERC20;
    let tDAI: ERC20;
    let tUSDC:ERC20; 
    let swapLendingContract: PlainLendingPool; 
    let LP_token: IStableSwapLP;

    before(async function(){
        DAI= await ethers.getContractAt("ERC20",process.env.DAI);
        USDC= await ethers.getContractAt("ERC20",process.env.USDC);
        tDAI= await ethers.getContractAt("ERC20",process.env.tDAI);
        tUSDC=await ethers.getContractAt("ERC20",process.env.tUSDC);
        swapLendingContract=await ethers.getContractAt("PlainLendingPool",process.env.PLAIN_LENDING_POOL);
        LP_token = await ethers.getContractAt("IStableSwapLP", process.env.PLAIN_LENDING_POOL_TOKEN);
    })



    //  it("should add liquidity", async function () {

    //     let txDAI= await DAI.approve(swapLendingContract.address,1e4); 
    //     await txDAI.wait();
    //     let txUSDC= await USDC.approve(swapLendingContract.address,1e4); 
    //     await txUSDC.wait();
    //     let txtDAI= await tDAI.approve(swapLendingContract.address,1e6);
    //     await txtDAI.wait();
    //     let txtUSDC= await tUSDC.approve(swapLendingContract.address,1e6);
    //     await txtUSDC.wait();

        // let tx = await LP_token.setMinter(process.env.PLAIN_LENDING_POOL);
        // await tx.wait();
        // console.log(tx);

    //     await expect(
    //       swapLendingContract.add_liquidity([0,1e6],0,false)
    //     ).to.be.revertedWith("Initial deposit requires all coins")

    //     await expect(
    //       swapLendingContract.add_liquidity([1e6,0],0,false)     
    //     ).to.be.revertedWith("Initial deposit requires all coins")

    //     await expect(
    //     swapLendingContract.add_liquidity([1e6,1e6],100000000000000000000n,false)
    //     ).to.be.revertedWith("Slippage screwed you")


        // test with swap wrapped tokens 
        
        // let tx1=await swapLendingContract.add_liquidity([100,100],0,false);
        // await tx1.wait();
        // console.log(tx1);

        // let LP_balance=await  LP_token.balanceOf(process.env.PUBLIC_KEY);
        // let LP_totalSupply=await LP_token.totalSupply();
        // expect(LP_balance.toString()).to.equal(LP_totalSupply.toString())

        // // test with underlying tokens

        // let tx2=await swapLendingContract.add_liquidity([100,100],0,true);
        // await tx2.wait();
        // console.log(tx2);

        // let LP_balance_2=await  LP_token.balanceOf(process.env.PUBLIC_KEY);
        // let LP_totalSupply_2=await LP_token.totalSupply();
        // expect(LP_balance_2.toString()).to.equal(LP_totalSupply_2.toString())

    //  })

    //  it("User use  wrapped token to exchange in Swap Lending Stable Pool", async function(){
    //     let txtDAI=await tDAI.approve(swapLendingContract.address,10);
    //     await txtDAI.wait();

    //     let expected_token1_balance=await swapLendingContract.get_dy(0,1,10); 
    //     let user_token1_balance_before=await tUSDC.balanceOf(process.env.PUBLIC_KEY);        
        
    //     let tx = await swapLendingContract.exchange(0,1,10,0);
    //     await tx.wait()
    //     console.log(tx);
        

    //     let user_token1_balance_after=await tUSDC.balanceOf(process.env.PUBLIC_KEY);

    //     const exchangedToken1Amount= user_token1_balance_after-user_token1_balance_before;

    //     expect(exchangedToken1Amount.toString()).to.equal(expected_token1_balance.toString());

    //  })

    //  it("User use underlying token to exchange in Swap Lending Stable Pool", async function(){

    //     let txDAI=await DAI.approve(swapLendingContract.address,1e6);
    //     await txDAI.wait();

    //     // let expected_token1_balance=await swapLendingContract.get_dy(0,1,1e6); 
    //     let user_token0_balance_before=await DAI.balanceOf(process.env.PUBLIC_KEY);
    //     let user_token1_balance_before=await USDC.balanceOf(process.env.PUBLIC_KEY);

        
    //     let tx = await swapLendingContract.exchange_underlying(0,1,1e6,0);
    //     await tx.wait()
    //     console.log(tx);
        
    //     let user_token0_balance_after=await DAI.balanceOf(process.env.PUBLIC_KEY);
    //     let user_token1_balance_after=await USDC.balanceOf(process.env.PUBLIC_KEY);

    //     const exchangedToken0Amount=user_token0_balance_before - user_token0_balance_after;
    //     const exchangedToken1Amount= user_token1_balance_after-user_token1_balance_before;

    //     console.log("exchange DAI amount:" , exchangedToken0Amount);
    //     console.log("redeemed USDC amount: ",exchangedToken1Amount);

    //     // expect(exchangedToken1Amount.toString()).to.equal(expected_token1_balance.toString());

    //  })

    //  it("should remove liquidity to get wrapped coins", async function(){

    //     let LP_token_before=await LP_token.balanceOf(process.env.PUBLIC_KEY);
    //     let token0_balance_before=await tDAI.balanceOf(process.env.PUBLIC_KEY);
    //     let token1_balance_before=await tUSDC.balanceOf(process.env.PUBLIC_KEY);
    //     console.log(await LP_token.totalSupply());
    //     let remove_LP_balance=1e9;

    //     let tx=await swapLendingContract.remove_liquidity(remove_LP_balance,[0,0],false);
    //     await tx.wait();
    //     console.log(tx);
        

    //     let token0_balance_after=await tDAI.balanceOf(process.env.PUBLIC_KEY);
    //     let token1_balance_after=await tUSDC.balanceOf(process.env.PUBLIC_KEY);
    //     let LP_token_balance_after=await LP_token.balanceOf(process.env.PUBLIC_KEY);

    //     const resultLP=LP_token_before-LP_token_balance_after;
    //     expect(resultLP.toString()).to.equal(remove_LP_balance.toString());
    //     console.log("redeemed token0 amount: ",token0_balance_after-token0_balance_before);
    //     console.log("redeemed token1 amount: ",token1_balance_after-token1_balance_before);

    //  })

    //  it("should remove liquidity to get underlying coins ", async function(){

    //     let LP_token_before=await LP_token.balanceOf(process.env.PUBLIC_KEY);
    //     console.log(LP_token_before);
        
    //     let token0_balance_before=await DAI.balanceOf(process.env.PUBLIC_KEY);
    //     let token1_balance_before=await USDC.balanceOf(process.env.PUBLIC_KEY);
        
    //     let remove_LP_balance=3e11;
    //     let tx=await swapLendingContract.remove_liquidity(remove_LP_balance,[0,0],true);
    //     await tx.wait();
    //     console.log(tx);
        

    //     let token0_balance_after=await DAI.balanceOf(process.env.PUBLIC_KEY);
    //     let token1_balance_after=await USDC.balanceOf(process.env.PUBLIC_KEY);
    //     let LP_token_balance_after=await LP_token.balanceOf(process.env.PUBLIC_KEY);

    //     const resultLP=LP_token_before-LP_token_balance_after;
    //     expect(resultLP.toString()).to.equal(remove_LP_balance.toString());
    //     console.log("redeemed token0 amount: ",token0_balance_after-token0_balance_before);
    //     console.log("redeemed token1 amount: ",token1_balance_after-token1_balance_before);

    //  })


     it("should remove liquidity imbalance", async function(){

        let LP_token_before=await LP_token.balanceOf(process.env.PUBLIC_KEY);
        let token0_balance_before=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_before=await tUSDC.balanceOf(process.env.PUBLIC_KEY);
        
        let remove_token_amounts=[10,1];
        let max_burn_amount=await swapLendingContract.calc_token_amount(remove_token_amounts,false);
        
        let tx=await swapLendingContract.remove_liquidity_imbalance(remove_token_amounts,max_burn_amount,false);
        await tx.wait();
        console.log(tx);
        

        let token0_balance_after=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_after=await tUSDC.balanceOf(process.env.PUBLIC_KEY);
        let LP_token_balance_after=await LP_token.balanceOf(process.env.PUBLIC_KEY);

        const resultLP=LP_token_before-LP_token_balance_after;
        expect(resultLP.toString()).to.equal(max_burn_amount.toString());
        console.log("redeemed token0 amount: ",token0_balance_after-token0_balance_before);
        console.log("redeemed token1 amount: ",token1_balance_after-token1_balance_before);
        
     })
})