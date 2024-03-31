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


        //create BUSD and USDC pool and add liquidity 
        let txCreate2Pair = await stableSwapFactory.createSwapPair(BUSD.address, USDC.address, A, Fee, AdminFee);
        await txCreate2Pair.wait();
        const BUSD_USDC_address = (await stableSwapFactory.getPairInfo(BUSD.address, USDC.address))[0];
        stableSwap2Pool_BUSD_USDC = await ethers.getContractAt("StableSwapTwoPool", BUSD_USDC_address);
        let txBUSDApp = await BUSD.approve(BUSD_USDC_address, 1000000n);
        await txBUSDApp.wait();
        let txUSDCApp = await USDC.approve(BUSD_USDC_address, 1000000n);
        await txUSDCApp.wait();
        const txAddLiquidity = await stableSwap2Pool_BUSD_USDC.add_liquidity([1000000n, 1000000n], 0,await getOption());
        await txAddLiquidity.wait();

        //create BUSD and USDC and USDT pool and add liquidity
        let txCreate3Pool = await stableSwapFactory.createThreePoolPair(BUSD.address, USDC.address, USDT.address, A, Fee, AdminFee);
        await txCreate3Pool.wait();
        const BUSD_USDC_USDT_address = (await stableSwapFactory.getThreePoolPairInfo(BUSD.address, USDC.address))[0];
        stableSwap3Pool_BUSD_USDC_USDT = await ethers.getContractAt("StableSwapThreePool", BUSD_USDC_USDT_address);
        let txBUSDApp2 = await BUSD.approve(BUSD_USDC_USDT_address, 1000000n);
        await txBUSDApp2.wait();
        let txUSDCApp2 = await USDC.approve(BUSD_USDC_USDT_address, 1000000n);
        await txUSDCApp2.wait();
        let txUSDTApp2 = await USDT.approve(BUSD_USDC_USDT_address, 1000000n);
        await txUSDTApp2.wait();
        const txAddLiquidity2 = await stableSwap3Pool_BUSD_USDC_USDT.add_liquidity([1000000n, 1000000n, 1000000n],0,await getOption());
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


    
    it("exac input swap: swap 100 BUSD-> USDC on two pool", async () => {

        const BUSD_balances_before = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDC_balances_before = await USDC.balanceOf(process.env.PUBLIC_KEY);

        let txBUSD = await BUSD.approve(stableSwapRouter.address, 1000n);
        await txBUSD.wait();

        const tx = await stableSwapRouter.exactInputStableSwap([BUSD.address, USDC.address], [2], 1000n, 0, process.env.PUBLIC_KEY,await getOption());
        await tx.wait();

        const BUSD_balances_after = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDC_balances_after = await USDC.balanceOf(process.env.PUBLIC_KEY);

        console.log("Exchanged BUSD amount: ", (BUSD_balances_before - BUSD_balances_after));
        console.log("Received USDT amount: ", (USDC_balances_after - USDC_balances_before));



    })
    it("exac input swap 100 BUSD->USDC in two pool and swap USDC amount-> USDT in three pool", async () => {

        const BUSD_balances_before = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDT_balances_before = await USDT.balanceOf(process.env.PUBLIC_KEY);

        let txBUSD = await BUSD.approve(stableSwapRouter.address, 1000n);
        await txBUSD.wait();

        const tx = await stableSwapRouter.exactInputStableSwap([BUSD.address, USDC.address, USDT.address], [2, 3], 1000n, 0, process.env.PUBLIC_KEY,await getOption());
        await tx.wait();

        const BUSD_balances_after = await BUSD.balanceOf(process.env.PUBLIC_KEY);
        const USDT_balances_after = await USDT.balanceOf(process.env.PUBLIC_KEY);


        console.log("Exchanged BUSD amount: ", (BUSD_balances_before - BUSD_balances_after));
        console.log("Received USDT amount: ", (USDT_balances_after - USDT_balances_before));
    })

    it("get BUSD to  be needed to get 100 USDC when you swap BUSD ->USDC in 2 pool ", async () => {

        const tx = await stableSwapRouter.getOutputStableSwap([BUSD.address, USDC.address], [2], 1000n, 10000n)
        console.log("amount: ", tx);
    })

    it("get BUSD to  be needed to get 100 USDT when you swap BUSD ->USDC in 2 pool  and USDC->USDT in 3 pool", async () => {

        const tx = await stableSwapRouter.getOutputStableSwap([BUSD.address, USDC.address, USDT.address], [2, 3], 1000n, 10000n)
        console.log("amount: ", tx);
    })


})