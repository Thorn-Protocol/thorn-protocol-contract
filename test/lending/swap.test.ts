import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { IERC20, IStableSwap } from "../../typechain-types";



dotenv.config();

describe("Swap Trava Contract Tests",function(){

    let DAI :IERC20;
    let Trava: IERC20;
    let tDAI: IERC20;
    let tTrava:IERC20; 
    //need to change 
    let swapLendingContract: IStableSwap; 

    let LP_token: IERC20;

    before(async function(){
        DAI= await ethers.getContractAt("IERC20",process.env.DAI);
        Trava= await ethers.getContractAt("IERC20",process.env.Trava);
        tDAI= await ethers.getContractAt("IERC20",process.env.tDAI);
        tTrava=await ethers.getContractAt("IERC20",process.env.tTrava);
        //need to change
        swapLendingContract=await ethers.getContractAt("IStableSwap",process.env.SwapLendingStable);
        
    })



     it("should add liquidity", async function () {

        let txDAI= await DAI.approve(swapLendingContract.address,1e6); 
        await txDAI.wait();
        let txTrava= await Trava.approve(swapLendingContract.address,1e6); 
        await txDAI.wait();
        let txtDAI= await tDAI.approve(swapLendingContract.address,1e6);
        await txtDAI.wait();
        let txtTrava= await tTrava.approve(swapLendingContract.address,1e6);
        await txtTrava.wait();

        await expect(
            swapLendingContract.add_liquidity([0,1e6],0,true)
        ).to.be.revertedWith("Initial deposit requires all coins")

        await expect(
            swapLendingContract.add_liquidity([1e6,0],0,true)
        ).to.be.revertedWith("Initial deposit requires all coins")

        await expect(
            swapLendingContract.add_liquidity([1e6,1e6],1e7,true)
        ).to.be.revertedWith("Slippage screwed you")


        //test with swap wrapped tokens 
        let tx1=await swapLendingContract.add_liquidity([1e6,1e6],0,false);
        await tx1.wait();

        let LP_balance=await  LP_token.balanceOf(process.env.PUBLIC_KEY);
        let LP_totalSupply=await LP_token.totalSupply();
        expect(LP_balance.toString()).to.equal(LP_totalSupply.toString())

        //test with underlying tokens 

        let tx2=await swapLendingContract.add_liquidity([1e6,1e6],0,true);
        await tx2.wait();

        let LP_balance_2=await  LP_token.balanceOf(process.env.PUBLIC_KEY);
        let LP_totalSupply_2=await LP_token.totalSupply();
        expect(LP_balance_2.toString()).to.equal(LP_totalSupply_2.toString())

     })

     it("User use  wrapped token to exchange in Swap Lending Stable Pool", async function(){
        let txtDai=await tDAI.approve(swapLendingContract.address,1e6);
        await txtDai.wait();

        let expected_token1_balance=await swapLendingContract.get_dy(0,1,1e6); 
        let user_token0_balance_before=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let user_token1_balance_before=await tTrava.balanceOf(process.env.PUBLIC_KEY);

        
        await swapLendingContract.exchange(0,1,1e6,0);

        let user_token0_balance_after=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let user_token1_balance_after=await tTrava.balanceOf(process.env.PUBLIC_KEY);

        const exchangedToken0Amount=user_token0_balance_before - user_token0_balance_after;
        const exchangedToken1Amount= user_token1_balance_after-user_token1_balance_before;

        expect(exchangedToken0Amount.toString()).to.equal("1000000");
        expect(exchangedToken1Amount.toString()).to.equal(expected_token1_balance.toString());

     })

     it("User use underlying token to exchange in Swap Lending Stable Pool", async function(){

        let txDai=await DAI.approve(swapLendingContract.address,1e6);
        await txDai.wait();

        // let expected_token1_balance=await swapLendingContract.get_dy(0,1,1e6); 
        let user_token0_balance_before=await DAI.balanceOf(process.env.PUBLIC_KEY);
        let user_token1_balance_before=await Trava.balanceOf(process.env.PUBLIC_KEY);

        
        await swapLendingContract.exchange_underlying(0,1,1e6,0);

        let user_token0_balance_after=await DAI.balanceOf(process.env.PUBLIC_KEY);
        let user_token1_balance_after=await Trava.balanceOf(process.env.PUBLIC_KEY);

        const exchangedToken0Amount=user_token0_balance_before - user_token0_balance_after;
        const exchangedToken1Amount= user_token1_balance_after-user_token1_balance_before;

        expect(exchangedToken0Amount.toString()).to.equal("1000000");

        console.log("redeemed Trava amount: ",exchangedToken1Amount);

        // expect(exchangedToken1Amount.toString()).to.equal(expected_token1_balance.toString());

     })

     it("should remove liquidity to get wrapped coins", async function(){

        let LP_token_before=await LP_token.balanceOf(process.env.PUBLIC_KEY);
        let token0_balance_before=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_before=await tTrava.balanceOf(process.env.PUBLIC_KEY);
        let remove_LP_balance=1e6;
        let tx=await swapLendingContract.remove_liquidity(remove_LP_balance,[0,0],false);
        await tx.wait();

        let token0_balance_after=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_after=await tTrava.balanceOf(process.env.PUBLIC_KEY);
        let LP_token_balance_after=await LP_token.balanceOf(process.env.PUBLIC_KEY);

        const resultLP=LP_token_balance_after-LP_token_before;
        expect(resultLP.toString()).to.equal("1000000");
        console.log("redeemed token0 amount: ",token0_balance_after-token0_balance_before);
        console.log("redeemed token1 amount: ",token1_balance_after-token1_balance_before);

     })

     it("should remove liquidity to get underlying coins ", async function(){

        let LP_token_before=await LP_token.balanceOf(process.env.PUBLIC_KEY);
        let token0_balance_before=await DAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_before=await Trava.balanceOf(process.env.PUBLIC_KEY);
        let remove_LP_balance=1e6;
        let tx=await swapLendingContract.remove_liquidity(remove_LP_balance,[0,0],true);
        await tx.wait();

        let token0_balance_after=await DAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_after=await Trava.balanceOf(process.env.PUBLIC_KEY);
        let LP_token_balance_after=await LP_token.balanceOf(process.env.PUBLIC_KEY);

        const resultLP=LP_token_balance_after-LP_token_before;
        expect(resultLP.toString()).to.equal("1000000");
        console.log("redeemed token0 amount: ",token0_balance_after-token0_balance_before);
        console.log("redeemed token1 amount: ",token1_balance_after-token1_balance_before);

     })


     it("should remove liquidity imbalance", async function(){

        let LP_token_before=await LP_token.balanceOf(process.env.PUBLIC_KEY);
        let token0_balance_before=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_before=await tTrava.balanceOf(process.env.PUBLIC_KEY);
        let remove_token_amounts=[1e3,1e3];
        let max_burn_amount=await swapLendingContract.calc_token_amount(remove_token_amounts,false);
        let tx=await swapLendingContract.remove_liquidity_imbalance(remove_token_amounts,max_burn_amount,false);
        await tx.wait();

        let token0_balance_after=await tDAI.balanceOf(process.env.PUBLIC_KEY);
        let token1_balance_after=await tTrava.balanceOf(process.env.PUBLIC_KEY);
        let LP_token_balance_after=await LP_token.balanceOf(process.env.PUBLIC_KEY);

        const resultLP=LP_token_balance_after-LP_token_before;
        expect(resultLP.toString()).to.equal(max_burn_amount.toString());
        console.log("redeemed token0 amount: ",token0_balance_after-token0_balance_before);
        console.log("redeemed token1 amount: ",token1_balance_after-token1_balance_before);
        


     })

})