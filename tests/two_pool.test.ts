import { ethers, upgrades} from "hardhat";
import { expect, assert } from "chai";
import * as dotenv from "dotenv";
import { StableSwapFactory, StableSwapInfo, StableSwapLP, StableSwapTwoPool, StableSwapTwoPoolInfo, Token, StableSwapLPFactory, StableSwapTwoPoolDeployer, StableSwapThreePoolDeployer, StableSwapThreePoolInfo } from "../typechain-types";
import { BigNumber} from "ethers";
import { getOption } from "../scripts/utils/helper";
dotenv.config();

describe("StableSwapTwoPool Contract Tests", function () {
    this.timeout(150000);
    let factory: StableSwapFactory
    let swapDeployer: StableSwapTwoPoolDeployer
    let swapTriplePoolDeployer: StableSwapThreePoolDeployer
    let LPFactory: StableSwapLPFactory
    let BUSD: Token 
    let USDC: Token
    let swap_BUSD_USDC: StableSwapTwoPool
    let LP_BUSD_USDC: StableSwapLP
    let token0: Token
    let token1: Token
    let twoPoolInfoSC: StableSwapTwoPoolInfo 
    let threePoolInfoSC: StableSwapThreePoolInfo
    let poolInfoSC: StableSwapInfo 

    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;
    const N_COINS = 2;
    const Slippage = BigNumber.from(99); //0.99
    const SlippageMax = BigNumber.from(10100); //1.01
    const Slippage_PRECISION = BigNumber.from(10000);
    const user1 = process.env.PUBLIC_KEY;

    before(async function () {
        const LPFactory_CF = await ethers.getContractFactory("StableSwapLPFactory");
        LPFactory = await upgrades.deployProxy(LPFactory_CF);

        const swapDeployerCF = await ethers.getContractFactory("StableSwapTwoPoolDeployer");
        swapDeployer = await upgrades.deployProxy(swapDeployerCF);
        
        const swapTriplePoolDeployerCF = await ethers.getContractFactory("StableSwapThreePoolDeployer");
        swapTriplePoolDeployer = await upgrades.deployProxy(swapTriplePoolDeployerCF);

        const factoryCF = await ethers.getContractFactory("StableSwapFactory");
        factory = await upgrades.deployProxy(factoryCF, [LPFactory.address, swapDeployer.address, swapTriplePoolDeployer.address]);
        
        let tx1 = await LPFactory.transferOwnership(factory.address);
        await tx1.wait();
        let tx2 = await swapDeployer.transferOwnership(factory.address);
        await tx2.wait();
        let tx3 = await swapTriplePoolDeployer.transferOwnership(factory.address);
        await tx3.wait();

        const BUSD_CF = await ethers.getContractFactory("Token");
        BUSD = await BUSD_CF.deploy("Binance USD", "BUSD", 18);

        const USDC_CF = await ethers.getContractFactory("Token");
        USDC = await USDC_CF.deploy("USD Coin", "USDC", 18);
 
        let tx4 = await BUSD.mint(user1, 1e10);
        await tx4.wait();
        let tx5 = await USDC.mint(user1, 1e10);
        await tx5.wait();

        let tx = await factory.createSwapPair(BUSD.address, USDC.address, A, Fee, AdminFee);
        await tx.wait();
        let info = await factory.getPairInfo(BUSD.address, USDC.address);
        swap_BUSD_USDC = await ethers.getContractAt("StableSwapTwoPool", info.swapContract)
        LP_BUSD_USDC = await ethers.getContractAt("StableSwapLP", info.LPContract)
        token0 = await ethers.getContractAt("Token", info.token0);
        token1 = await ethers.getContractAt("Token", info.token1);

        const threePoolInfoSC_CF = await ethers.getContractFactory("StableSwapThreePoolInfo");
        threePoolInfoSC = await threePoolInfoSC_CF.deploy();

        const twoPoolInfoSC_CF = await ethers.getContractFactory("StableSwapTwoPoolInfo");
        twoPoolInfoSC = await twoPoolInfoSC_CF.deploy();

        const poolInfoSC_CF = await ethers.getContractFactory("StableSwapInfo");
        poolInfoSC = await poolInfoSC_CF.deploy(twoPoolInfoSC.address, threePoolInfoSC.address);

        // factory = await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
        // BUSD = await ethers.getContractAt("Token", process.env.BUSD);
        // USDC = await ethers.getContractAt("Token", process.env.USDC);
        // let info = await factory.getPairInfo(BUSD.address, USDC.address);
        // swap_BUSD_USDC = await ethers.getContractAt("StableSwapTwoPool",info.swapContract);
        // LP_BUSD_USDC = await ethers.getContractAt("StableSwapLP", info.LPContract);
        // token0 = await ethers.getContractAt("Token", info.token0);
        // token1 = await ethers.getContractAt("Token", info.token1);
        // threePoolInfoSC = await ethers.getContractAt("StableSwapThreePoolInfo",process.env.STABLE_SWAP_THREE_POOL_INFO);
        // twoPoolInfoSC = await ethers.getContractAt("StableSwapTwoPoolInfo",process.env.STABLE_SWAP_TWO_POOL_INFO);
        // poolInfoSC = await ethers.getContractAt("StableSwapInfo",process.env.STABLE_SWAP_INFO);

    });

    it("Check pair info between factory and swap smart contract", async () => {
        let info = await factory.getPairInfo(BUSD.address, USDC.address);
        assert.equal(info.swapContract, swap_BUSD_USDC.address);
        let token0 = await swap_BUSD_USDC.coins(0);
        let token1 = await swap_BUSD_USDC.coins(1);
        let LPToken = await swap_BUSD_USDC.token();
        assert.equal(info.token0, token0);
        assert.equal(info.token1, token1);
        assert.equal(info.LPContract, LPToken);
      });

    it("should add liquidity", async function () {
        let tx1 = await BUSD.approve(swap_BUSD_USDC.address, 1e6);
        await tx1.wait();
        let tx2 = await USDC.approve(swap_BUSD_USDC.address, 1e6);
        await tx2.wait();

        await expect(
            swap_BUSD_USDC.add_liquidity([0, 1e6], 0)
        ).to.be.reverted; //Initial deposit requires all coins

        await expect(
            swap_BUSD_USDC.add_liquidity([1e6, 0], 0)
        ).to.be.reverted; //Initial deposit requires all coins

        await expect(
            swap_BUSD_USDC.add_liquidity([1e6, 1e6], 2e7),
        ).to.be.reverted; //Slippage screwed you

        const expect_LP_balance = 2e6;
        let tx = await swap_BUSD_USDC.add_liquidity([1e6, 1e6], expect_LP_balance, await getOption());
        await tx.wait();
        let LP_balance = await LP_BUSD_USDC.balanceOf(user1);
        let LP_totalSupply = await LP_BUSD_USDC.totalSupply();
        assert.equal(expect_LP_balance.toString(), LP_balance.toString());
        assert.equal(LP_totalSupply.toString(), LP_balance.toString());
    });

    it("should add one coin into liquidity", async function () {
        let tx1 = await BUSD.approve(swap_BUSD_USDC.address, 1e6);
        await tx1.wait();
        let tx2 = await USDC.approve(swap_BUSD_USDC.address, 1e6);
        await tx2.wait();

        let expect_LP_balance0 = await twoPoolInfoSC.get_add_liquidity_mint_amount(swap_BUSD_USDC.address, [1e3,0]);
        let token0_balance_before = await swap_BUSD_USDC.balances(0);
        let token1_balance_before = await swap_BUSD_USDC.balances(1);
        let defaultToken0Amount = 1e3;
        let liquidityAdminFee = await twoPoolInfoSC.get_add_liquidity_fee(swap_BUSD_USDC.address, [
          defaultToken0Amount,
          0,
        ]);
        let tx = await swap_BUSD_USDC.add_liquidity([defaultToken0Amount, 0], expect_LP_balance0, await getOption());
        await tx.wait();
        let token0_balance_after = await swap_BUSD_USDC.balances(0);
        let token1_balance_after = await swap_BUSD_USDC.balances(1);
        let realAddToken0 = BigNumber.from(token0_balance_after.toString()).sub(BigNumber.from(token0_balance_before.toString()));
        let realLiquidityToken0AdminFee = BigNumber.from(defaultToken0Amount.toString()).sub(BigNumber.from(realAddToken0.toString()));
        let realLiquidityToken1AdminFee = BigNumber.from(token1_balance_before.toString()).sub(BigNumber.from(token1_balance_after.toString()));
        // check admin fee
        assert.equal(realLiquidityToken0AdminFee.toString(), liquidityAdminFee[0].toString());
        assert.equal(realLiquidityToken1AdminFee.toString(), liquidityAdminFee[1].toString());
    });

    it("should remove liquidity", async function () {
        let LP_balance_before = await LP_BUSD_USDC.balanceOf(user1);
        let token0_balance_before = await token0.balanceOf(user1);
        let token1_balance_before = await token1.balanceOf(user1);
        
        let remove_LP_balance = 1e3;
        let expectCoins = await twoPoolInfoSC.calc_coins_amount(swap_BUSD_USDC.address, remove_LP_balance);
        let tx = await swap_BUSD_USDC.remove_liquidity(remove_LP_balance, [0, 0], await getOption());
        await tx.wait();
        let LP_balance_after = await LP_BUSD_USDC.balanceOf(user1);
        let token0_balance_after = await token0.balanceOf(user1);
        let token1_balance_after = await token1.balanceOf(user1);
        //check lp balance
        assert.equal((LP_balance_before - LP_balance_after).toString(), remove_LP_balance.toString());
        //check check token0 balance
        assert.equal((token0_balance_after - token0_balance_before).toString(), expectCoins[0].toString());
        //check check token1 balance
        assert.equal((token1_balance_after - token1_balance_before).toString(), expectCoins[1].toString());
    });
    
    it("Remove liquidity imbalance", async () => {
        let user_LP_balance_before = await LP_BUSD_USDC.balanceOf(user1);
        let LP_totalSupply_before = await LP_BUSD_USDC.totalSupply();
        let user_token0_balance_before = await token0.balanceOf(user1);
        let user_token1_balance_before = await token1.balanceOf(user1);
        let swap_token0_balance_before = await swap_BUSD_USDC.balances(0);
        let swap_token1_balance_before = await swap_BUSD_USDC.balances(1);
        let defaultTokenAmount = 1e3;
        let remove_token_amounts = [defaultTokenAmount, defaultTokenAmount];
        let liquidityAdminFee = await twoPoolInfoSC.get_remove_liquidity_imbalance_fee(
          swap_BUSD_USDC.address,
          remove_token_amounts
        );
        let max_burn_amount = await swap_BUSD_USDC.calc_token_amount(remove_token_amounts, false);
        let maxburn_amount = BigNumber.from(max_burn_amount.toString())
        maxburn_amount = BigNumber.from(maxburn_amount.toString()).mul(SlippageMax).div(Slippage_PRECISION);
        let tx =await swap_BUSD_USDC.remove_liquidity_imbalance(remove_token_amounts, maxburn_amount, await getOption());
        await tx.wait();
        let user_LP_balance_after = await LP_BUSD_USDC.balanceOf(user1);
        let LP_totalSupply_after = await LP_BUSD_USDC.totalSupply();
        let user_token0_balance_after = await token0.balanceOf(user1);
        let user_token1_balance_after = await token1.balanceOf(user1);
        let swap_token0_balance_after = await swap_BUSD_USDC.balances(0);
        let swap_token1_balance_after = await swap_BUSD_USDC.balances(1);
        assert.equal(
          defaultTokenAmount.toString(),
          (swap_token0_balance_before - swap_token0_balance_after - liquidityAdminFee[0]).toString()
        );
        assert.equal(
          defaultTokenAmount.toString(),
          (swap_token1_balance_before - swap_token1_balance_after - liquidityAdminFee[1]).toString()
        );
        assert.equal(
          (LP_totalSupply_before - LP_totalSupply_after).toString(),
          (user_LP_balance_before - user_LP_balance_after).toString()
        );
        assert.equal(defaultTokenAmount.toString(), (user_token0_balance_after - user_token0_balance_before).toString());
        assert.equal(defaultTokenAmount.toString(), (user_token1_balance_after - user_token1_balance_before).toString());
        //check fee , swap_token0_balance_before = swap_token0_balance_after + defaultTokenAmount + token0AdminFee
        assert.equal(
          swap_token0_balance_before.toString(),
          BigNumber.from(swap_token0_balance_after.toString())
            .add(BigNumber.from(defaultTokenAmount.toString()))
            .add(BigNumber.from(liquidityAdminFee[0].toString()))
            .toString()
        );
        //check fee , swap_token1_balance_before = swap_token1_balance_after + defaultTokenAmounyt + token1AdminFee
        assert.equal(
          swap_token1_balance_before.toString(),
          BigNumber.from(swap_token1_balance_after.toString())
            .add(BigNumber.from(defaultTokenAmount.toString()))
            .add(BigNumber.from(liquidityAdminFee[1].toString()))
            .toString()
        );
      });
  
      it("Remove liquidity one_coin", async () => {
        let defaultTokenAmount = 1e3;
        let user_token1_balance_before = await token1.balanceOf(user1);
        let expect_Token1_amount = await swap_BUSD_USDC.calc_withdraw_one_coin(defaultTokenAmount, 1);
        let tx = await swap_BUSD_USDC.remove_liquidity_one_coin(defaultTokenAmount, 1, expect_Token1_amount, await getOption());
        await tx.wait();
        let user_token1_balance_after = await token1.balanceOf(user1);
        assert((user_token1_balance_after - user_token1_balance_before).toString(), expect_Token1_amount.toString());
      });

    it("Swap token0 to token1", async () => {
        let tx4 = await token0.approve(swap_BUSD_USDC.address, 1e4);
        await tx4.wait();
        let exchange_token0_balance = 1e3;
        let expect_token1_balance = await swap_BUSD_USDC.get_dy(0, 1, exchange_token0_balance);
        let cal_dx_amount = await poolInfoSC.get_dx(
          swap_BUSD_USDC.address,
          0,
          1,
          expect_token1_balance,
          1e3
        );
        //check get_dx
        assert.equal(exchange_token0_balance.toString(), cal_dx_amount.toString());
        let exchangeFees = await twoPoolInfoSC.get_exchange_fee(swap_BUSD_USDC.address, 0, 1, exchange_token0_balance);
        let user_token0_balance_before = await token0.balanceOf(user1);
        let user_token1_balance_before = await token1.balanceOf(user1);
        let swapContract_token1_balance_before = await token1.balanceOf(swap_BUSD_USDC.address);
        let swap_token1_balance_before = await swap_BUSD_USDC.balances(1);
        let token1_admin_fee_before = await swap_BUSD_USDC.admin_balances(1);
        let tx = await swap_BUSD_USDC.exchange(0, 1, exchange_token0_balance, expect_token1_balance, await getOption());
        await tx.wait();
        let user_token0_balance_after = await token0.balanceOf(user1);
        let token1_admin_fee_after = await swap_BUSD_USDC.admin_balances(1);
        let swapContract_token1_balance_after = await token1.balanceOf(swap_BUSD_USDC.address);
        let swap_token1_balance_after = await swap_BUSD_USDC.balances(1);
        let user_token1_balance_after = await token1.balanceOf(user1);
        //check user token0 balance
        assert.equal(
          exchange_token0_balance.toString(),
          (user_token0_balance_before - user_token0_balance_after).toString()
        );
        //check exchange admmin fee
        assert.equal(exchangeFees[1].toString(), (token1_admin_fee_after - token1_admin_fee_before).toString());
        //check get_dy
        assert.equal(
          (user_token1_balance_after - user_token1_balance_before).toString(),
          expect_token1_balance.toString()
        );
        //check token1 balance
        assert.equal(
          (user_token1_balance_after - user_token1_balance_before).toString(),
          (swap_token1_balance_before - swap_token1_balance_after - exchangeFees[1]).toString()
        );
        assert.equal(
          (user_token1_balance_after - user_token1_balance_before).toString(),
          (swapContract_token1_balance_before - swapContract_token1_balance_after).toString()
        );
      });
});