import { ethers, upgrades,deployments} from "hardhat";
import * as hre from "hardhat";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory, StableSwapInfo, StableSwapLPFactory, StableSwapRouter, StableSwapThreePool, StableSwapThreePoolDeployer, StableSwapThreePoolInfo, StableSwapTwoPool, StableSwapTwoPoolDeployer, StableSwapTwoPoolInfo, Token } from "../typechain-types";
import { getOption, writeToEnvFile } from "../src/utils/helper";
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
    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;
    before(async () => {
        //deploy 3 tokens 
        let BUSDfac = await ethers.getContractFactory("Token");
        let USDCfac = await ethers.getContractFactory("Token");
        let USDTfac = await ethers.getContractFactory("Token");

        BUSD = await BUSDfac.deploy("Binance USD", "BUSD", 18);
        let txmint1 = await BUSD.mint(process.env.PUBLIC_KEY, 1e10);
        await txmint1.wait();
        USDC = await USDCfac.deploy("C USD", "USDC", 18);
        let txmint2 = await USDC.mint(process.env.PUBLIC_KEY, 1e10);
        await txmint2.wait();
        USDT = await USDTfac.deploy("T USD", "USDT", 18);
        let txmint3 = await USDT.mint(process.env.PUBLIC_KEY, 1e10);
        await txmint3.wait();

        //deploy 3Info,2Info and swapInfo contracdt
        const stableSwapThreePoolInfoFactory = await ethers.getContractFactory("StableSwapThreePoolInfo");
        stableSwap3Info = await stableSwapThreePoolInfoFactory.deploy();
        const stableSwapTwoPoolInfoFactory = await ethers.getContractFactory("StableSwapTwoPoolInfo");
        stableSwap2Info = await stableSwapTwoPoolInfoFactory.deploy();
        const stableSwapInfoFactory = await ethers.getContractFactory("StableSwapInfo");
        stableSwapInfo = await stableSwapInfoFactory.deploy(
            stableSwap2Info.address,
            stableSwap3Info.address
        );

        //delpoy 3Deployer and 2 Deployer, LP  Contract 
        const stableSwapThreePoolDeployerFactory = await ethers.getContractFactory("StableSwapThreePoolDeployer");
        stableSwapThreeDeployer = await upgrades.deployProxy(stableSwapThreePoolDeployerFactory);

        const stableSwapTwoPoolDeployerFactory = await ethers.getContractFactory("StableSwapTwoPoolDeployer");
        stableSwapTwoDeployer = await upgrades.deployProxy(stableSwapTwoPoolDeployerFactory);

        const stableSwapLPFactory_FC = await ethers.getContractFactory("StableSwapLPFactory");
        stableSwapLPFactory = await upgrades.deployProxy(stableSwapLPFactory_FC);
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
                        process.env.PUBLIC_KEY],
                },
                },
                    
            }, 
            
            log: true,
            skipIfAlreadyDeployed: false,
        });
        
       
        stableSwapFactory=await ethers.getContractAt("StableSwapFactory",tx_stable_swap_factory.address);


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
        stableSwap2Pool_BUSD_USDC = await ethers.getContractAt("StableSwapTwoPool", info_2.swapContract);
        token0_2_pool= await ethers.getContractAt("Token",info_2.token0);
        token1_2_pool=await ethers.getContractAt("Token",info_2.token1);
        //add liquidity
        const token0_2_pool_amount=1000000n;
        const token1_2_pool_amount=1000000n;
        let txToken0_2App = await token0_2_pool.approve(stableSwap2Pool_BUSD_USDC.address,token0_2_pool_amount);
        await txToken0_2App.wait();
        let txToken1_2App = await token1_2_pool.approve(stableSwap2Pool_BUSD_USDC.address,token1_2_pool_amount);
        await txToken1_2App.wait();
        const txAddLiquidity = await stableSwap2Pool_BUSD_USDC.add_liquidity([token0_2_pool_amount, token1_2_pool_amount], 0, await getOption());
        await txAddLiquidity.wait();

        //create BUSD and USDC and USDT pool  
        let txCreate3Pool = await stableSwapFactory.createThreePoolPair(BUSD.address, USDC.address, USDT.address, A, Fee, AdminFee);
        await txCreate3Pool.wait();
        let info_3 = await stableSwapFactory.getThreePoolPairInfo(BUSD.address, USDC.address);
        //get BUSD and USDC, USDT  pool information
        stableSwap3Pool_BUSD_USDC_USDT = await ethers.getContractAt("StableSwapThreePool", info_3.swapContract);
        token0_3_pool= await ethers.getContractAt("Token",info_3.token0);
        token1_3_pool=await ethers.getContractAt("Token",info_3.token1);
        token2_3_pool=await ethers.getContractAt("Token",info_3.token2);
        ////add liquidity
        const token0_3_pool_amount=1000000n;
        const token1_3_pool_amount=1000000n;
        const token2_3_pool_amount=1000000n;
        let txToken0_3App = await token0_2_pool.approve(stableSwap3Pool_BUSD_USDC_USDT.address,token0_3_pool_amount );
        await txToken0_3App.wait();
        let txToken1_3App = await token1_3_pool.approve(stableSwap3Pool_BUSD_USDC_USDT.address,token1_3_pool_amount );
        await txToken1_3App.wait();
        let txToken2_3App = await token2_3_pool.approve(stableSwap3Pool_BUSD_USDC_USDT.address,token2_3_pool_amount );
        await txToken2_3App.wait();
        const txAddLiquidity2 = await stableSwap3Pool_BUSD_USDC_USDT.add_liquidity([token0_3_pool_amount, token1_3_pool_amount, token2_3_pool_amount],0, await getOption());
        await txAddLiquidity2.wait();

        // create smart contract router
        const SmartRouterHelperFactory = await ethers.getContractFactory("SmartRouterHelper");
        const SmartRouterHelperContract = await SmartRouterHelperFactory.deploy();

        const stableSwapRouterFactory = await ethers.getContractFactory("StableSwapRouter", {
            libraries: {
                SmartRouterHelper: SmartRouterHelperContract.address,
            }
        });

        stableSwapRouter = await upgrades.deployProxy(stableSwapRouterFactory, [
            stableSwapFactory.address,
            stableSwapInfo.address
        ], {
            unsafeAllowLinkedLibraries: true
        })
    })


    
    it("exac input swap: swap 1000 BUSD-> USDC on two pool", async () => {

        const BUSD_balances_before = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDC_balances_before = await USDC.balanceOf(process.env.PUBLIC_KEY);

        const swap_amount=1000n;

        let txBUSD = await BUSD.approve(stableSwapRouter.address, swap_amount);
        await txBUSD.wait();
        
        
        const tx = await stableSwapRouter.exactInputStableSwap([BUSD.address, USDC.address], [2], swap_amount, 0, process.env.PUBLIC_KEY, await getOption());
        await tx.wait();

        const BUSD_balances_after = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDC_balances_after = await USDC.balanceOf(process.env.PUBLIC_KEY);

        console.log("Exchanged BUSD amount: ", (BUSD_balances_before - BUSD_balances_after));
        console.log("Received USDT amount: ", (USDC_balances_after - USDC_balances_before));
    })

    it("exac input swap 1000 BUSD->USDC in two pool and swap USDC amount-> USDT in three pool", async () => {

        const BUSD_balances_before = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDT_balances_before = await USDT.balanceOf(process.env.PUBLIC_KEY);

        const swap_amount=1000n;

        let txBUSD = await BUSD.approve(stableSwapRouter.address, swap_amount);
        await txBUSD.wait();

        const tx = await stableSwapRouter.exactInputStableSwap([BUSD.address, USDC.address, USDT.address], [2, 3], swap_amount, 0, process.env.PUBLIC_KEY, await getOption());
        await tx.wait();

        const BUSD_balances_after = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDT_balances_after = await USDT.balanceOf(process.env.PUBLIC_KEY);


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