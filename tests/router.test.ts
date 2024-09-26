import { ethers, upgrades,deployments} from "hardhat";
import * as hre from "hardhat";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory, StableSwapInfo, StableSwapLPFactory, StableSwapRouter, StableSwapThreePool, StableSwapThreePoolDeployer, StableSwapThreePoolInfo, StableSwapTwoPoolDeployer, StableSwapTwoPoolInfo, Token } from "../typechain-types";
import { StableSwapTwoPool } from '../typechain-types/contracts/stableSwap/plain-pools/StableSwapTwoPool';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
dotenv.config();

describe("test router", function () {
    this.timeout(1500000)
    let stableSwapRouter: StableSwapRouter;
    let stableSwapTwoDeployer: StableSwapTwoPoolDeployer;
    let stableSwapThreeDeployer: StableSwapThreePoolDeployer;
    let stableSwap3Pool_BUSD_USDC_USDT: StableSwapThreePool;
    let stableSwap2Pool_BUSD_USDC: StableSwapTwoPool;
    let stableSwapLPFactory: StableSwapLPFactory;
    let stableSwapInfo: StableSwapInfo;
    let stableSwap3Info: StableSwapThreePoolInfo;
    let stableSwap2Info: StableSwapTwoPoolInfo;
    let stableSwapFactory: StableSwapFactory;
    let BUSD: Token;
    let USDC: Token;
    let USDT: Token;
    let token0_2_pool: Token;
    let token1_2_pool: Token;
    let token0_3_pool: Token;
    let token1_3_pool: Token;
    let token2_3_pool: Token;
    let accounts: SignerWithAddress[];
    let ADD_AMOUNT=1000000n;
    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;
    before(async () => {
        //deploy 3 tokens 
        accounts = await ethers.getSigners();
        let BUSDfac = await ethers.getContractFactory("Token");
        let USDCfac = await ethers.getContractFactory("Token");
        let USDTfac = await ethers.getContractFactory("Token");

        BUSD = await BUSDfac.deploy("Binance USD", "BUSD", 18) as unknown as Token;
        let txmint1 = await BUSD.mint(accounts[0].address, 1e10);
        await txmint1.wait();
        USDC = await USDCfac.deploy("C USD", "USDC", 18) as unknown as Token;
        let txmint2 = await USDC.mint(accounts[0].address, 1e10)  ;
        await txmint2.wait();
        USDT = await USDTfac.deploy("T USD", "USDT", 18) as unknown as Token;
        let txmint3 = await USDT.mint(accounts[0].address, 1e10) ;
        await txmint3.wait();

        //deploy 3Info,2Info and swapInfo contracdt
        const stableSwapThreePoolInfoFactory = await ethers.getContractFactory("StableSwapThreePoolInfo");
        stableSwap3Info = await stableSwapThreePoolInfoFactory.deploy() as unknown as StableSwapThreePoolInfo;
        const stableSwapTwoPoolInfoFactory = await ethers.getContractFactory("StableSwapTwoPoolInfo");
        stableSwap2Info = await stableSwapTwoPoolInfoFactory.deploy() as unknown as StableSwapTwoPoolInfo;
        const stableSwapInfoFactory = await ethers.getContractFactory("StableSwapInfo");
        stableSwapInfo = await stableSwapInfoFactory.deploy(
            stableSwap2Info.address,
            stableSwap3Info.address
        ) as unknown as StableSwapInfo;

        //delpoy 3Deployer and 2 Deployer, LP  Contract 
        const stableSwapThreePoolDeployerFactory = await ethers.getContractFactory("StableSwapThreePoolDeployer");
        stableSwapThreeDeployer = await stableSwapThreePoolDeployerFactory.deploy() as unknown as StableSwapThreePoolDeployer;
        await stableSwapThreeDeployer.deployed();

        const stableSwapTwoPoolDeployerFactory = await ethers.getContractFactory("StableSwapTwoPoolDeployer");
        stableSwapTwoDeployer = await stableSwapTwoPoolDeployerFactory.deploy() as unknown as StableSwapTwoPoolDeployer;
        await stableSwapTwoDeployer.deployed();

        const stableSwapLPFactory_FC = await ethers.getContractFactory("StableSwapLPFactory");
        stableSwapLPFactory = await stableSwapLPFactory_FC.deploy() as unknown as StableSwapLPFactory;
        await stableSwapLPFactory.deployed();

        //deploy StableSwapFactory Contract
        const {deploy} = deployments;
        const[deployer] = await hre.getUnnamedAccounts();
        console.log(deployer);
        let tx_stable_swap_factory= await deploy("StableSwapFactory", {
            from: deployer,
            proxy: {
                owner: deployer,
                execute: 
                {
                       
                    init:  {
                    methodName: "initialize",
                    args: [
                        stableSwapLPFactory.address,
                        stableSwapTwoDeployer.address,
                        stableSwapThreeDeployer.address,
                        accounts[0].address],
                },
                },
                    
            }, 
            
            log: true,
            skipIfAlreadyDeployed: false,
        });
        
       
        stableSwapFactory=await ethers.getContractAt("StableSwapFactory",tx_stable_swap_factory.address) as unknown as StableSwapFactory;


        // transfer ownership to StableSwapFactory
        let tx1 = await stableSwapLPFactory.transferOwnership(stableSwapFactory.address);
        await tx1.wait();
        let tx2 = await stableSwapTwoDeployer.transferOwnership(stableSwapFactory.address);
        await tx2.wait();
        let tx3 = await stableSwapThreeDeployer.transferOwnership(stableSwapFactory.address);
        await tx3.wait();
         

        //create BUSD and USDC pool 
        let txCreate2Pair = await stableSwapFactory.createSwapPair(BUSD.address, USDC.address, A, Fee, AdminFee);
        await txCreate2Pair.wait();
        let info_2 = await stableSwapFactory.getPairInfo(BUSD.address, USDC.address);
        //get BUSD and USDC pool information 
        stableSwap2Pool_BUSD_USDC = await ethers.getContractAt("StableSwapTwoPool", info_2.swapContract) as unknown as StableSwapTwoPool;
        token0_2_pool= await ethers.getContractAt("Token",info_2.token0) as unknown as Token;
        token1_2_pool=await ethers.getContractAt("Token",info_2.token1) as unknown as Token;
        //add liquidity
        let txToken0_2App = await token0_2_pool.approve(stableSwap2Pool_BUSD_USDC.address,ADD_AMOUNT);
        await txToken0_2App.wait();
        let txToken1_2App = await token1_2_pool.approve(stableSwap2Pool_BUSD_USDC.address,ADD_AMOUNT);
        await txToken1_2App.wait();
        const txAddLiquidity = await stableSwap2Pool_BUSD_USDC.add_liquidity([ADD_AMOUNT, ADD_AMOUNT], 0);
        await txAddLiquidity.wait();

        //create BUSD and USDC and USDT pool  
        let txCreate3Pool = await stableSwapFactory.createThreePoolPair(BUSD.address, USDC.address, USDT.address, A, Fee, AdminFee);
        await txCreate3Pool.wait();
        let info_3 = await stableSwapFactory.getThreePoolPairInfo(BUSD.address, USDC.address);
        //get BUSD and USDC, USDT  pool information
        stableSwap3Pool_BUSD_USDC_USDT = await ethers.getContractAt("StableSwapThreePool", info_3.swapContract) as unknown as StableSwapThreePool;
        token0_3_pool= await ethers.getContractAt("Token",info_3.token0) as unknown as Token;
        token1_3_pool=await ethers.getContractAt("Token",info_3.token1) as unknown as Token;
        token2_3_pool=await ethers.getContractAt("Token",info_3.token2) as unknown as Token;
        ////add liquidity
     
        let txToken0_3App = await token0_2_pool.approve(stableSwap3Pool_BUSD_USDC_USDT.address,ADD_AMOUNT );
        await txToken0_3App.wait();
        let txToken1_3App = await token1_3_pool.approve(stableSwap3Pool_BUSD_USDC_USDT.address,ADD_AMOUNT );
        await txToken1_3App.wait();
        let txToken2_3App = await token2_3_pool.approve(stableSwap3Pool_BUSD_USDC_USDT.address,ADD_AMOUNT );
        await txToken2_3App.wait();
        const txAddLiquidity2 = await stableSwap3Pool_BUSD_USDC_USDT.add_liquidity([ADD_AMOUNT, ADD_AMOUNT, ADD_AMOUNT],0);
        await txAddLiquidity2.wait();

        // create smart contract router
        const SmartRouterHelperFactory = await ethers.getContractFactory("SmartRouterHelper");
        const SmartRouterHelperContract = await SmartRouterHelperFactory.deploy();

        const stableSwapRouterFactory = await ethers.getContractFactory("StableSwapRouter", {
            libraries: {
                SmartRouterHelper: SmartRouterHelperContract.address,
            }
        });

        stableSwapRouter = await stableSwapRouterFactory.deploy(
            stableSwapFactory.address,
            stableSwapInfo.address
        ) as unknown as StableSwapRouter;
    })


    
    it("exac input swap: swap 1000 BUSD-> USDC on two pool", async () => {

        const BUSD_balances_before = await BUSD.balanceOf(accounts[0].address);
        const USDC_balances_before = await USDC.balanceOf(accounts[0].address);

        const swap_amount=1000n;

        let txBUSD = await BUSD.approve(stableSwapRouter.address, swap_amount);
        await txBUSD.wait();
        
        
        const tx = await stableSwapRouter.exactInputStableSwap([BUSD.address, USDC.address], [2], swap_amount, 0, accounts[0].address);
        await tx.wait();

        const BUSD_balances_after = await BUSD.balanceOf(accounts[0].address);
        const USDC_balances_after = await USDC.balanceOf(accounts[0].address);

        console.log("Exchanged BUSD amount: ", (BUSD_balances_before - BUSD_balances_after));
        console.log("Received USDT amount: ", (USDC_balances_after - USDC_balances_before));
    })

    it("exac input swap 1000 BUSD->USDC in two pool and swap USDC amount-> USDT in three pool", async () => {

        const BUSD_balances_before = await BUSD.balanceOf(accounts[0].address);
        const USDT_balances_before = await USDT.balanceOf(accounts[0].address);

        const swap_amount=1000n;

        let txBUSD = await BUSD.approve(stableSwapRouter.address, swap_amount);
        await txBUSD.wait();

        const tx = await stableSwapRouter.exactInputStableSwap([BUSD.address, USDC.address, USDT.address], [2, 3], swap_amount, 0, accounts[0].address);
        await tx.wait();

        const BUSD_balances_after = await BUSD.balanceOf(accounts[0].address);
        const USDT_balances_after = await USDT.balanceOf(accounts[0].address);


        console.log("Exchanged BUSD amount: ", (BUSD_balances_before - BUSD_balances_after));
        console.log("Received USDT amount: ", (USDT_balances_after - USDT_balances_before));
    })

    it("get BUSD to  be needed to get 100000 USDC when you swap BUSD ->USDC in 2 pool ", async () => {

        const swap_amount=100000n;
        const maximum_exchanged_amount=10000000n;

        const tx = await stableSwapRouter.getInputStableSwap([BUSD.address, USDC.address], [2], swap_amount, maximum_exchanged_amount)
        console.log("amount: ", tx);
    })

    it("get BUSD to  be needed to get 100000 USDT when you swap BUSD ->USDC in 2 pool  and USDC->USDT in 3 pool", async () => {

        const swap_amount=100000n;
        const maximum_exchanged_amount=10000000n;

        const tx = await stableSwapRouter.getInputStableSwap([BUSD.address, USDC.address, USDT.address], [2, 3], swap_amount, maximum_exchanged_amount)
        console.log("amount: ", tx);
    })


    it("get output if swap 100000n BUSD->USDC in two pool and swap USDC amount-> USDT in three pool ", async () => {

        const swap_amount=100000n;
        const min_redeem_amount=0n;

        const tx = await stableSwapRouter.getOutputStableSwap([BUSD.address, USDC.address, USDT.address], [2, 3], swap_amount, min_redeem_amount)
        console.log("amount: ", tx);
    })
})