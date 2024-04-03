import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory, StableSwapInfo, StableSwapLPFactory, StableSwapRouter, StableSwapThreePool, StableSwapThreePoolDeployer, StableSwapThreePoolInfo, StableSwapTwoPool, StableSwapTwoPoolDeployer, StableSwapTwoPoolInfo, Token } from "../typechain-types";
import { getOption } from "../scripts/utils/helper";
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

        //deploy StableSwapFactory Contractd 
        const stableSwapFactory_FC = await ethers.getContractFactory("StableSwapFactory");
        stableSwapFactory = await upgrades.deployProxy(stableSwapFactory_FC, [
            stableSwapLPFactory.address,
            stableSwapTwoDeployer.address,
            stableSwapThreeDeployer.address
        ]);

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
        const BUSD_USDC_address = (await stableSwapFactory.getPairInfo(BUSD.address, USDC.address))[0];
        stableSwap2Pool_BUSD_USDC = await ethers.getContractAt("StableSwapTwoPool", BUSD_USDC_address);
        //get BUSD and USDC pool information 
        let info_2 = await stableSwapFactory.getPairInfo(BUSD.address, USDC.address);
        token0_2_pool= await ethers.getContractAt("Token",info_2.token0);
        token1_2_pool=await ethers.getContractAt("Token",info_2.token1);
        //add liquidity
        const token0_2_pool_amount=1000000n;
        const token1_2_pool_amount=1000000n;
        let txToken0_2App = await token0_2_pool.approve(token0_2_pool.address,token0_2_pool_amount);
        await txToken0_2App.wait();
        let txToken1_2App = await token0_2_pool.approve(token1_2_pool.address,token1_2_pool_amount);
        await txToken1_2App.wait();
        const txAddLiquidity = await stableSwap2Pool_BUSD_USDC.add_liquidity([token0_2_pool_amount, token1_2_pool_amount], 0, await getOption());
        await txAddLiquidity.wait();

        //create BUSD and USDC and USDT pool  
        let txCreate3Pool = await stableSwapFactory.createThreePoolPair(BUSD.address, USDC.address, USDT.address, A, Fee, AdminFee);
        await txCreate3Pool.wait();
        const BUSD_USDC_USDT_address = (await stableSwapFactory.getThreePoolPairInfo(BUSD.address, USDC.address))[0];
        stableSwap3Pool_BUSD_USDC_USDT = await ethers.getContractAt("StableSwapThreePool", BUSD_USDC_USDT_address);
        //get BUSD and USDC, USDT  pool information
        let info_3 = await stableSwapFactory.getThreePoolPairInfo(BUSD.address, USDC.address);
        token0_3_pool= await ethers.getContractAt("Token",info_3.token0);
        token1_3_pool=await ethers.getContractAt("Token",info_3.token1);
        token2_3_pool=await ethers.getContractAt("Token",info_3.token2);
        ////add liquidity
        const token0_3_pool_amount=1000000n;
        const token1_3_pool_amount=1000000n;
        const token2_3_pool_amount=1000000n;
        let txToken0_3App = await token0_2_pool.approve(token0_3_pool.address,token0_3_pool_amount );
        await txToken0_3App.wait();
        let txToken1_3App = await token0_3_pool.approve(token1_3_pool.address,token1_3_pool_amount );
        await txToken1_3App.wait();
        let txToken2_3App = await token0_3_pool.approve(token2_3_pool.address,token2_3_pool_amount );
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

        // stableSwapFactory = await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY);
        // BUSD = await ethers.getContractAt("Token", process.env.BUSD);
        // USDC = await ethers.getContractAt("Token", process.env.USDC);
        // USDT = await ethers.getContractAt("Token", process.env.USDT);
        // let info2pool = await stableSwapFactory.getPairInfo(BUSD.address, USDC.address);
        // stableSwap2Pool_BUSD_USDC = await ethers.getContractAt("StableSwapTwoPool",info2pool.swapContract);
        // let info3pool = await stableSwapFactory.getThreePoolPairInfo(BUSD.address, USDC.address);
        // stableSwap3Pool_BUSD_USDC_USDT = await ethers.getContractAt("StableSwapThreePool",info3pool.swapContract);
        // stableSwap3Info = await ethers.getContractAt("StableSwapThreePoolInfo",process.env.STABLE_SWAP_THREE_POOL_INFO);
        // stableSwap2Info = await ethers.getContractAt("StableSwapTwoPoolInfo",process.env.STABLE_SWAP_TWO_POOL_INFO);
        // stableSwapInfo = await ethers.getContractAt("StableSwapInfo",process.env.STABLE_SWAP_INFO);
        // stableSwapRouter = await ethers.getContractAt("StableSwapRouter", process.env.STABLE_SWAP_ROUTER);
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

        const tx = await stableSwapRouter.getOutputStableSwap([BUSD.address, USDC.address], [2], swap_amount, maximum_exchanged_amount)
        console.log("amount: ", tx);
    })

    it("get BUSD to  be needed to get 100000 USDT when you swap BUSD ->USDC in 2 pool  and USDC->USDT in 3 pool", async () => {

        const swap_amount=100000n;
        const maximum_exchanged_amount=10000000n;

        const tx = await stableSwapRouter.getOutputStableSwap([BUSD.address, USDC.address, USDT.address], [2, 3], swap_amount, maximum_exchanged_amount)
        console.log("amount: ", tx);
    })
})