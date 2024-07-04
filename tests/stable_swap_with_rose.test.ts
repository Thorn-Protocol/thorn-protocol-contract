import { ethers, waffle, upgrades} from "hardhat";
import { expect, assert } from "chai";
import * as dotenv from "dotenv";
import { StableSwapFactory, StableSwapInfo, StableSwapLP, StableSwapTwoPool, StableSwapTwoPoolInfo, Token, StableSwapLPFactory, StableSwapTwoPoolDeployer, StableSwapThreePoolDeployer, StableSwapThreePoolInfo } from "../typechain-types";
import { BigNumber} from "ethers";
import { getOption, writeToEnvFile } from "../src/utils/helper";
dotenv.config();

describe("StableSwapTwoPool Contract Tests with ROSE", function () {
    this.timeout(150000);
    let factory: StableSwapFactory
    let swapDeployer: StableSwapTwoPoolDeployer
    let swapTriplePoolDeployer: StableSwapThreePoolDeployer
    let LPFactory: StableSwapLPFactory
    let WROSE: Token 
    let swap_ROSE_WROSE: StableSwapTwoPool
    let LP_ROSE_WROSE: StableSwapLP
    let ROSE_index: number
    let twoPoolInfoSC: StableSwapTwoPoolInfo 
    let threePoolInfoSC: StableSwapThreePoolInfo
    let poolInfoSC: StableSwapInfo 

    const ROSEAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
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

        const WROSE_CF = await ethers.getContractFactory("Token");
        WROSE = await WROSE_CF.deploy("Wrapped ROSE", "WROSE", 18);
        writeToEnvFile("WROSE", WROSE.address);

 
        let tx4 = await WROSE.mint(user1, 1e10);
        await tx4.wait();

        let tx = await factory.createSwapPair(WROSE.address, ROSEAddress, A, Fee, AdminFee);
        await tx.wait();
        let info = await factory.getPairInfo(WROSE.address, ROSEAddress);
        swap_ROSE_WROSE = await ethers.getContractAt("StableSwapTwoPool", info.swapContract)
        LP_ROSE_WROSE = await ethers.getContractAt("StableSwapLP", info.LPContract)
        if (info.token0 == ROSEAddress) {
            ROSE_index = 0;
          } else {
            ROSE_index = 1;
          }

        const threePoolInfoSC_CF = await ethers.getContractFactory("StableSwapThreePoolInfo");
        threePoolInfoSC = await threePoolInfoSC_CF.deploy();

        const twoPoolInfoSC_CF = await ethers.getContractFactory("StableSwapTwoPoolInfo");
        twoPoolInfoSC = await twoPoolInfoSC_CF.deploy();

        const poolInfoSC_CF = await ethers.getContractFactory("StableSwapInfo");
        poolInfoSC = await poolInfoSC_CF.deploy(twoPoolInfoSC.address, threePoolInfoSC.address);
    });

    it("Check pair info between factory and swap smart contract", async () => {
        let info = await factory.getPairInfo(WROSE.address, ROSEAddress);
        assert.equal(info.swapContract, swap_ROSE_WROSE.address);
        let token0 = await swap_ROSE_WROSE.coins(0);
        let token1 = await swap_ROSE_WROSE.coins(1);
        let LPToken = await swap_ROSE_WROSE.token();
        assert.equal(info.token0, token0);
        assert.equal(info.token1, token1);
        assert.equal(info.LPContract, LPToken);
      });

    it("should add liquidity with ROSE", async function () {
        let tx1 = await WROSE.approve(swap_ROSE_WROSE.address, 1e6);
        await tx1.wait();

        if (ROSE_index == 0) {
            await expect(
              swap_ROSE_WROSE.add_liquidity([0, 1e6], 0,)
            ).to.be.reverted; //Initial deposit requires all coins;
          
            await expect(
              swap_ROSE_WROSE.add_liquidity([1e6, 0], 0, { value: 1e6 })
            ).to.be.reverted; //Initial deposit requires all coins;
          
            await expect(
              swap_ROSE_WROSE.add_liquidity([1e6, 1e6], 0, { value: 0 })
            ).to.be.reverted; //Inconsistent quantity;
          
            await expect(
              swap_ROSE_WROSE.add_liquidity([1e6, 1e6], 0, { value: 1e5 })
            ).to.be.reverted; //Inconsistent quantity);
          
            await expect(
              swap_ROSE_WROSE.add_liquidity([1e6, 1e6], 0, { value: 1e7 })
          ).to.be.reverted; //Inconsistent quantity
      
          } else {
            await expect(
              swap_ROSE_WROSE.add_liquidity([0, 1e6], 0, { value: 1e6})
            ).to.be.reverted; //Initial deposit requires all coins;
          
            await expect(
              swap_ROSE_WROSE.add_liquidity([1e6, 0], 0)
            ).to.be.reverted; //Initial deposit requires all coins;
          }
          

          const expect_LP_balance = 2e6;
          const options = await getOption();
          let tx = await swap_ROSE_WROSE.add_liquidity([1e6, 1e6], expect_LP_balance, {value: 1e6, gasPrice: options.gasPrice, nonce: options.nonce});
          await tx.wait();
          let LP_balance = await LP_ROSE_WROSE.balanceOf(user1);
          let LP_totalSupply = await LP_ROSE_WROSE.totalSupply();
          assert.equal(expect_LP_balance.toString(), LP_balance.toString());
          assert.equal(LP_totalSupply.toString(), LP_balance.toString());
    });

    it("should add one coin into liquidity with ROSE", async function () {
        let tx1 = await WROSE.approve(swap_ROSE_WROSE.address, 1e6);
        await tx1.wait();
        let expect_LP_balance0 = await twoPoolInfoSC.get_add_liquidity_mint_amount(swap_ROSE_WROSE.address, [1e3,0]);
        let token0_balance_before = await swap_ROSE_WROSE.balances(0);
        let token1_balance_before = await swap_ROSE_WROSE.balances(1);
        let LP_balance0_before = await LP_ROSE_WROSE.balanceOf(user1);
        let defaultToken0Amount = 1e3;
        let liquidityAdminFee = await twoPoolInfoSC.get_add_liquidity_fee(swap_ROSE_WROSE.address, [defaultToken0Amount,0]);
        const options = await getOption();
        if (ROSE_index == 0) {
          let tx = await swap_ROSE_WROSE.add_liquidity([defaultToken0Amount, 0], expect_LP_balance0, {value: 1e3, gasPrice: options.gasPrice, nonce: options.nonce});
          await tx.wait();
        } else {
          let tx = await swap_ROSE_WROSE.add_liquidity([defaultToken0Amount, 0], expect_LP_balance0, {value: 0, gasPrice: options.gasPrice, nonce: options.nonce});
          await tx.wait();
        }
        let token0_balance_after = await swap_ROSE_WROSE.balances(0);
        let token1_balance_after = await swap_ROSE_WROSE.balances(1);
        let realAddToken0 = token0_balance_after - token0_balance_before;
        let realLiquidityToken0AdminFee = BigNumber.from(defaultToken0Amount.toString()).sub(
          BigNumber.from(realAddToken0.toString())
        );
        let realLiquidityToken1AdminFee = token1_balance_before - token1_balance_after;
        // check admin fee
        assert.equal(realLiquidityToken0AdminFee.toString(), liquidityAdminFee[0].toString());
        assert.equal(realLiquidityToken1AdminFee.toString(), liquidityAdminFee[1].toString());
        let LP_balance0_after = await LP_ROSE_WROSE.balanceOf(user1);
        assert.equal((LP_balance0_after - LP_balance0_before).toString(), expect_LP_balance0.toString());
    });

    it("should remove liquidity with ROSE", async function () {
      let LP_balance_before = await LP_ROSE_WROSE.balanceOf(user1);
      let wROSE_balance_before = await WROSE.balanceOf(user1);
      let ROSE_balance_before = await waffle.provider.getBalance(user1!);
      
      let remove_LP_balance = 1e3;
      let expectCoins = await twoPoolInfoSC.calc_coins_amount(swap_ROSE_WROSE.address, remove_LP_balance);
      let tx = await swap_ROSE_WROSE.remove_liquidity(remove_LP_balance, [0, 0], await getOption());
      const receipt = await tx.wait();
      let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice);
      let LP_balance_after = await LP_ROSE_WROSE.balanceOf(user1);
      let wROSE_balance_after = await WROSE.balanceOf(user1);
      let ROSE_balance_after = await waffle.provider.getBalance(user1!);
      //check lp balance
      assert.equal((LP_balance_before - LP_balance_after).toString(), remove_LP_balance.toString());
      //check check token0 balance
      assert.equal((wROSE_balance_after - wROSE_balance_before).toString(), expectCoins[0].toString());
      //check check token1 balance: ROSE_balance_after - ROSE_balance_before = expectCoins[1] - gasUsed
      assert.equal(ROSE_balance_after.sub(ROSE_balance_before).toString(), BigNumber.from(expectCoins[1]).sub(gasUsed).toString());
    });

    it("Remove liquidity imbalance with ROSE", async () => {
        let user_LP_balance_before = await LP_ROSE_WROSE.balanceOf(user1);
        let LP_totalSupply_before = await LP_ROSE_WROSE.totalSupply();
        let user_wROSE_balance_before = await WROSE.balanceOf(user1);
        let user_ROSE_balance_before = await waffle.provider.getBalance(user1!);
        let swap_wROSE_balance_before;
        let swap_ROSE_balance_before;
        if (ROSE_index == 0) {
          swap_wROSE_balance_before = await swap_ROSE_WROSE.balances(1);
          swap_ROSE_balance_before = await swap_ROSE_WROSE.balances(0);
        } else {
          swap_wROSE_balance_before = await swap_ROSE_WROSE.balances(0);
          swap_ROSE_balance_before = await swap_ROSE_WROSE.balances(1);
        }
        let defaultTokenAmount = 1e3;
        let remove_token_amounts = [defaultTokenAmount, defaultTokenAmount];
        let liquidityAdminFee = await twoPoolInfoSC.get_remove_liquidity_imbalance_fee(
          swap_ROSE_WROSE.address,
          remove_token_amounts
        );
        let max_burn_amount = await swap_ROSE_WROSE.calc_token_amount(remove_token_amounts, false);
        let max_burnamount = BigNumber.from(max_burn_amount.toString())
        max_burnamount = max_burnamount.mul(SlippageMax).div(Slippage_PRECISION);

        let tx = await swap_ROSE_WROSE.remove_liquidity_imbalance(remove_token_amounts, max_burnamount, await getOption());
        const receipt = await tx.wait();
        let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice);

        let user_LP_balance_after = await LP_ROSE_WROSE.balanceOf(user1);
        let LP_totalSupply_after = await LP_ROSE_WROSE.totalSupply();
        let user_wROSE_balance_after = await WROSE.balanceOf(user1);
        let user_ROSE_balance_after = await waffle.provider.getBalance(user1!);
        let swap_wROSE_balance_after;
        let swap_ROSE_balance_after;
        if (ROSE_index == 0) {
          swap_wROSE_balance_after = await swap_ROSE_WROSE.balances(1);
          swap_ROSE_balance_after = await swap_ROSE_WROSE.balances(0);
        } else {
          swap_wROSE_balance_after = await swap_ROSE_WROSE.balances(0);
          swap_ROSE_balance_after = await swap_ROSE_WROSE.balances(1);
        }
        assert.equal(
          defaultTokenAmount.toString(),
          (swap_wROSE_balance_before - swap_wROSE_balance_after - liquidityAdminFee[0]).toString()
        );
        assert.equal(
          defaultTokenAmount.toString(),
          (swap_ROSE_balance_before - swap_ROSE_balance_after - liquidityAdminFee[1]).toString()
        );
        assert.equal(
          (LP_totalSupply_before - LP_totalSupply_after).toString(),
          (user_LP_balance_before - user_LP_balance_after).toString()
        );
        assert.equal(defaultTokenAmount.toString(), (user_wROSE_balance_after - user_wROSE_balance_before).toString());
        assert.equal(
          defaultTokenAmount.toString(),
          user_ROSE_balance_after.sub(user_ROSE_balance_before).add(gasUsed).toString()
        );
        //check fee , swap_token0_balance_before = swap_token0_balance_after + defaultTokenAmount + token0AdminFee
        assert.equal(
          swap_wROSE_balance_before.toString(),
          BigNumber.from(swap_wROSE_balance_after.toString())
            .add(BigNumber.from(defaultTokenAmount.toString()))
            .add(BigNumber.from(liquidityAdminFee[0].toString()))
            .toString()
        );
        //check fee , swap_token1_balance_before = swap_token1_balance_after + defaultTokenAmount + token1AdminFee
        assert.equal(
          swap_ROSE_balance_before.toString(),
          BigNumber.from(swap_ROSE_balance_after.toString())
            .add(BigNumber.from(defaultTokenAmount.toString()))
            .add(BigNumber.from(liquidityAdminFee[1].toString()))
            .toString()
        );
      });
  
      it("Remove liquidity one_coin with ROSE", async () => {
        let defaultTokenAmount = 1e3;
        let user_token1_balance_before = await waffle.provider.getBalance(user1!);
        let expect_Token1_amount = await swap_ROSE_WROSE.calc_withdraw_one_coin(defaultTokenAmount, 1);
        let tx;
        if (ROSE_index == 0) {
            tx = await swap_ROSE_WROSE.remove_liquidity_one_coin(defaultTokenAmount, 0, expect_Token1_amount, await getOption());
        } else {
            tx = await swap_ROSE_WROSE.remove_liquidity_one_coin(defaultTokenAmount, 1, expect_Token1_amount, await getOption());
        }
        const receipt = await tx.wait();
        let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice);
        let user_token1_balance_after = await waffle.provider.getBalance(user1!);
        assert(
            (user_token1_balance_after.sub(user_token1_balance_before).add(gasUsed)).toString(),
            expect_Token1_amount.toString()
          );
      });

      it("Swap wROSE to ROSE", async () => {
        let tx1 = await WROSE.approve(swap_ROSE_WROSE.address, 1e6);
        await tx1.wait()
        let exchange_wROSE_balance = 1e3;
        let expect_ROSE_balance;
        let exchangeFees;
        if (ROSE_index == 0) {
          expect_ROSE_balance = await swap_ROSE_WROSE.get_dy(1, 0, exchange_wROSE_balance);
          exchangeFees = await twoPoolInfoSC.get_exchange_fee(swap_ROSE_WROSE.address, 1, 0, exchange_wROSE_balance);
        } else {
          expect_ROSE_balance = await swap_ROSE_WROSE.get_dy(0, 1, exchange_wROSE_balance);
          exchangeFees = await twoPoolInfoSC.get_exchange_fee(swap_ROSE_WROSE.address, 0, 1, exchange_wROSE_balance);
        }
  
        let user_wROSE_balance_before;
        let user_ROSE_balance_before;
        user_wROSE_balance_before = await WROSE.balanceOf(user1);        
        user_ROSE_balance_before = await  waffle.provider.getBalance(user1!);
  
        let swapContract_ROSE_balance_before = await waffle.provider.getBalance(swap_ROSE_WROSE.address);
  
        let swap_ROSE_balance_before;
        if (ROSE_index == 0) {
          swap_ROSE_balance_before = await swap_ROSE_WROSE.balances(0);
        } else {
          swap_ROSE_balance_before = await swap_ROSE_WROSE.balances(1);
        }
  
        let ROSE_admin_fee_before;
        if (ROSE_index == 0) {
          ROSE_admin_fee_before = await swap_ROSE_WROSE.admin_balances(0);
        } else {
          ROSE_admin_fee_before = await swap_ROSE_WROSE.admin_balances(1);
        }
        let tx;
        if (ROSE_index == 0) {
          tx = await swap_ROSE_WROSE.exchange(1, 0, exchange_wROSE_balance, expect_ROSE_balance, await getOption());
        } else {
          tx = await swap_ROSE_WROSE.exchange(0, 1, exchange_wROSE_balance, expect_ROSE_balance, await getOption());
        }
        const receipt = await tx.wait();
        let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice);
        
        let ROSE_admin_fee_after;
        if (ROSE_index == 0) {
          ROSE_admin_fee_after = await swap_ROSE_WROSE.admin_balances(0);
        } else {
          ROSE_admin_fee_after = await swap_ROSE_WROSE.admin_balances(1);
        }
  
        let swapContract_ROSE_balance_after = await waffle.provider.getBalance(swap_ROSE_WROSE.address);
        
        let swap_ROSE_balance_after;
        if (ROSE_index == 0) {
          swap_ROSE_balance_after = await swap_ROSE_WROSE.balances(0);
        } else {
          swap_ROSE_balance_after = await swap_ROSE_WROSE.balances(1);
        }
        let user_wROSE_balance_after;
        let user_ROSE_balance_after;
        user_wROSE_balance_after = await WROSE.balanceOf(user1);
        user_ROSE_balance_after = await waffle.provider.getBalance(user1!);
        
        //check user wROSE balance
        assert.equal(exchange_wROSE_balance.toString(), (user_wROSE_balance_before - user_wROSE_balance_after).toString());
        //check exchange admmin fee
        assert.equal(exchangeFees[1].toString(), (ROSE_admin_fee_after - ROSE_admin_fee_before).toString());
        //check get_dy: expect_ROSE_balance = user_ROSE_balance_after - user_ROSE_balance_before + gasUsed
        assert.equal(
          user_ROSE_balance_after.sub(user_ROSE_balance_before).add(gasUsed).toString(),
          expect_ROSE_balance.toString()
        );
        //check ROSE balance
        assert.equal(
          user_ROSE_balance_after.sub(user_ROSE_balance_before).add(gasUsed).toString(),
          (swap_ROSE_balance_before - swap_ROSE_balance_after - exchangeFees[1]).toString()
        );
        assert.equal(
          user_ROSE_balance_after.sub(user_ROSE_balance_before).add(gasUsed).toString(),
          swapContract_ROSE_balance_before.sub(swapContract_ROSE_balance_after).toString()
        );
      });
  
      it("Swap ROSE to wROSE", async () => {
        let exchange_ROSE_balance = 1e3;
        let expect_wROSE_balance;
        let exchangeFees;
        if (ROSE_index == 0) {
          expect_wROSE_balance = await swap_ROSE_WROSE.get_dy(0, 1, exchange_ROSE_balance);
          exchangeFees = await twoPoolInfoSC.get_exchange_fee(swap_ROSE_WROSE.address, 0, 1, exchange_ROSE_balance);
        } else {
          expect_wROSE_balance = await swap_ROSE_WROSE.get_dy(1, 0, exchange_ROSE_balance);
          exchangeFees = await twoPoolInfoSC.get_exchange_fee(swap_ROSE_WROSE.address, 1, 0, exchange_ROSE_balance);
        }
  
        let user_wROSE_balance_before;
        let user_ROSE_balance_before;
        user_wROSE_balance_before = await WROSE.balanceOf(user1);
        user_ROSE_balance_before = await waffle.provider.getBalance(user1!);
  
        let swapContract_ROSE_balance_before = await waffle.provider.getBalance(swap_ROSE_WROSE.address);
  
        let swap_wROSE_balance_before;
        let swap_ROSE_balance_before;
        if (ROSE_index == 0) {
          swap_wROSE_balance_before = await swap_ROSE_WROSE.balances(1);
          swap_ROSE_balance_before = await swap_ROSE_WROSE.balances(0);
        } else {
          swap_wROSE_balance_before = await swap_ROSE_WROSE.balances(0);
          swap_ROSE_balance_before = await swap_ROSE_WROSE.balances(1);
        }
  
        assert.equal(swapContract_ROSE_balance_before.toString(), swap_ROSE_balance_before.toString());
  
        let wROSE_admin_fee_before;
        if (ROSE_index == 0) {
          wROSE_admin_fee_before = await swap_ROSE_WROSE.admin_balances(1);
        } else {
          wROSE_admin_fee_before = await swap_ROSE_WROSE.admin_balances(0);
        }
        let tx;
        const options = await getOption();
        if (ROSE_index == 0) {
          tx = await swap_ROSE_WROSE.exchange(0, 1, exchange_ROSE_balance, expect_wROSE_balance, {value: exchange_ROSE_balance, gasPrice: options.gasPrice, nonce: options.nonce});
        } else {
          tx = await swap_ROSE_WROSE.exchange(1, 0, exchange_ROSE_balance, expect_wROSE_balance, {value: exchange_ROSE_balance, gasPrice: options.gasPrice, nonce: options.nonce});
        }
        const receipt = await tx.wait();
        let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice);

        let wROSE_admin_fee_after;
        if (ROSE_index == 0) {
          wROSE_admin_fee_after = await swap_ROSE_WROSE.admin_balances(1);
        } else {
          wROSE_admin_fee_after = await swap_ROSE_WROSE.admin_balances(0);
        }
  
        let swapContract_ROSE_balance_after = await waffle.provider.getBalance(swap_ROSE_WROSE.address);
  
        let swap_wROSE_balance_after;
        let swap_ROSE_balance_after;
        if (ROSE_index == 0) {
          swap_wROSE_balance_after = await swap_ROSE_WROSE.balances(1);
          swap_ROSE_balance_after = await swap_ROSE_WROSE.balances(0);
        } else {
          swap_wROSE_balance_after = await swap_ROSE_WROSE.balances(0);
          swap_ROSE_balance_after = await swap_ROSE_WROSE.balances(1);
        }
  
        assert.equal(swapContract_ROSE_balance_after.toString(), swap_ROSE_balance_after.toString());
  
        let user_wROSE_balance_after;
        let user_ROSE_balance_after;
        user_wROSE_balance_after = await WROSE.balanceOf(user1);
        user_ROSE_balance_after = await waffle.provider.getBalance(user1!);
        //check user ROSE balance
        assert.equal(
          exchange_ROSE_balance.toString(),
          user_ROSE_balance_before.sub(user_ROSE_balance_after).sub(gasUsed).toString()
        );
        //check exchange admmin fee
        assert.equal(exchangeFees[1].toString(), (wROSE_admin_fee_after - wROSE_admin_fee_before).toString());
        //check get_dy
        assert.equal((user_wROSE_balance_after - user_wROSE_balance_before).toString(), expect_wROSE_balance.toString());
        //check wROSE balance
        assert.equal(
          (user_wROSE_balance_after - user_wROSE_balance_before).toString(),
          (swap_wROSE_balance_before - swap_wROSE_balance_after - exchangeFees[1]).toString()
        );
        assert.equal(
          user_ROSE_balance_after.sub(user_ROSE_balance_before).add(gasUsed).toString(),
          swapContract_ROSE_balance_before.sub(swapContract_ROSE_balance_after).toString()
        );
    });
});