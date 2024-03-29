import { ethers } from "hardhat";
import { expect, assert } from "chai";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory } from "../typechain-types";
import { BigNumber } from "ethers";
dotenv.config();

describe("StableSwapTwoPool Contract Tests", function () {
    this.timeout(150000);
    let factory: StableSwapFactory;
    let tokenA: ERC20;
    let tokenC: ERC20;

    before(async function () {
        factory = await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY!);
        tokenA = await ethers.getContractAt("ERC20", process.env.TOKEN_A!);
        tokenC = await ethers.getContractAt("ERC20", process.env.TOKEN_C!);
    });

    // it("should transfer ownership", async function () {
    //     // const StableSwapLPFactory =await  ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
    //     const StableSwapTwoPoolDeployer =await  ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
    //     let tx = await StableSwapTwoPoolDeployer.transferOwnership(process.env.STABLE_SWAP_FACTORY);
    //     await tx.wait();
    //     console.log(tx);
    // });

    // it("should create 2pool pair", async function () {
    //     const tx = await  factory.createSwapPair(
    //         process.env.TOKEN_A,
    //         process.env.TOKEN_C,
    //         1000,
    //         4000000,
    //         5000000000
    //     )
    //     await tx.wait();
    //     console.log(tx);
    // });

    // it("should get pair information", async function () {
    //     const info = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C);
    //     let swap_contract = await ethers.getContractAt("StableSwapTwoPool", info.swapContract);
    //     assert.equal(info.swapContract, swap_contract.address);
    //     let token0 = await swap_contract.coins(0);
    //     let token1 = await swap_contract.coins(1);
    //     let LPToken = await swap_contract.token();
    //     assert.equal(info.token0, token0);
    //     assert.equal(info.token1, token1);
    //     assert.equal(info.LPContract, LPToken);
    //     console.log(info);
        
    // });

    // it("should add liquidity", async function () {
    //     const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    //     const StableSwapTwoPool=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    //     const LPToken = await ethers.getContractAt("StableSwapLP", pairInfo[3])
    //     await tokenA.approve(pairInfo[0],1e6)
    //     await tokenC.approve(pairInfo[0],1e6)

        // await expect(
        //   StableSwapTwoPool.add_liquidity([0, 1e6], 0)
        // ).to.be.revertedWith("Initial deposit requires all coins");

        // await expect(
        //     StableSwapTwoPool.add_liquidity([1e6, 0], 0)
        // ).to.be.revertedWith("Initial deposit requires all coins");

        // await expect(
        //     StableSwapTwoPool.add_liquidity([1e6, 1e6], 2e7)
        // ).to.be.revertedWith("Slippage screwed you");
   
    //     const expect_LP_balance = 2e6;
    //     const tx=await StableSwapTwoPool.add_liquidity([1e6,1e6], 0)
    //     await tx.wait();
    //     console.log(tx);

    //     let LP_balance = await LPToken.balanceOf(process.env.PUBLIC_KEY);
    //     let LP_totalSupply = await LPToken.totalSupply();
    //     assert.equal(expect_LP_balance.toString(), LP_balance.toString());
    //     assert.equal(LP_totalSupply.toString(), LP_balance.toString());
    // });

    // it("should add one coin into liquidity", async function () {
    //     const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
    //     const StableSwapTwoPool=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
    //     const twoPoolInfoSC = await ethers.getContractAt("PancakeStableSwapTwoPoolInfo", process.env.STABLE_SWAP_TWO_POOL_INFO);
    //     const LPToken = await ethers.getContractAt("PancakeStableSwapLP", pairInfo[3])
    //     await tokenA.approve(pairInfo[0],1e6)
    //     await tokenC.approve(pairInfo[0],1e6)
    //     let defaultToken0Amount = 1e6;
    //     let expect_LP_balance = await twoPoolInfoSC.get_add_liquidity_mint_amount(StableSwapTwoPool.address, [
    //         defaultToken0Amount,
    //         0,
    //       ]);
    //     let token0_balance_before = await StableSwapTwoPool.balances(0);
    //     let token1_balance_before = await StableSwapTwoPool.balances(1);
    //     let LP_balance_before = await await LPToken.balanceOf(process.env.PUBLIC_KEY);
    //     let liquidityAdminFee = await twoPoolInfoSC.get_add_liquidity_fee(StableSwapTwoPool.address, [
    //         defaultToken0Amount,
    //       0,
    //     ]);
    //     await StableSwapTwoPool.add_liquidity([defaultToken0Amount, 0], expect_LP_balance);
    //     let token0_balance_after = await StableSwapTwoPool.balances(0);
    //     let token1_balance_after = await StableSwapTwoPool.balances(1);
    //     let realAddToken0 = token0_balance_after - token0_balance_before;
    //     let realLiquidityToken0AdminFee = BigNumber.from(defaultToken0Amount.toString()).sub(
    //     BigNumber.from(realAddToken0.toString())
    //     );
    //     let realLiquidityToken1AdminFee = token1_balance_before -token1_balance_after;
    //     // check admin fee
    //     assert.equal(realLiquidityToken0AdminFee.toString(), liquidityAdminFee[0].toString());
    //     assert.equal(realLiquidityToken1AdminFee.toString(), liquidityAdminFee[1].toString());
    //     let LP_balance_after = await LPToken.balanceOf(process.env.PUBLIC_KEY);
    //     let realLPToken = LP_balance_after - LP_balance_before
    //     assert.equal(realLPToken.toString(), expect_LP_balance.toString());
    // });

    it("should exchange", async function () {
        const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
        const StableSwapTwoPool=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);

        let tx=await tokenA.approve(pairInfo[0],100000000000000n)
        await  tx.wait();

        const tx1=await StableSwapTwoPool.exchange(0,1,100000000000000n,0)
        await tx1.wait();
        console.log(tx1);

        
    });

//     it("should remove liquidity from 2pool", async function () {
//         const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
//         const StableSwapTwoPool=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);

//         const lptoken = await ethers.getContractAt("ERC20", pairInfo[3]);
//         console.log(await lptoken.balanceOf(process.env.PUBLIC_KEY));

//         const tx=await StableSwapTwoPool.remove_liquidity(1998667333531366n, [0,0]);
//         await tx.wait();
//         console.log(tx);
//     });

//     it("should retrieve balances for 2pool", async function () {
//         const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
//         const StableSwapTwoPool= await ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
//         let tx = await StableSwapTwoPool.admin_balances(pairInfo[0]);
//         console.log(tx);
//     });
});