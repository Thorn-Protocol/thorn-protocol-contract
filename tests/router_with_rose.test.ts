import { ethers, upgrades,deployments, waffle} from "hardhat";
import * as hre from "hardhat";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory, StableSwapInfo, StableSwapLPFactory, StableSwapRouter, StableSwapThreePool, StableSwapThreePoolDeployer, StableSwapThreePoolInfo, StableSwapTwoPool, StableSwapTwoPoolDeployer, StableSwapTwoPoolInfo, Token, WrappedROSE } from "../typechain-types";
import { getOption, writeToEnvFile } from "../src/utils/helper";
import { BigNumber } from "ethers";
dotenv.config();

describe("test router", function () {
    this.timeout(1500000)
    let stableSwapRouter: StableSwapRouter;
    let stableSwapTwoDeployer: StableSwapTwoPoolDeployer;
    let stableSwapThreeDeployer: StableSwapThreePoolDeployer;
    let stableSwap3Pool_stROSE_pROSE_wROSE: StableSwapThreePool;
    let stableSwap2Pool_wROSE_stROSE: StableSwapTwoPool;
    let stableSwapLPFactory: StableSwapLPFactory;
    let stableSwapInfo: StableSwapInfo;
    let stableSwap3Info: StableSwapThreePoolInfo;
    let stableSwap2Info: StableSwapTwoPoolInfo;
    let stableSwapFactory: StableSwapFactory;
    let wROSE: ERC20;
    let stROSE: Token;
    let pROSE: Token;
    let token0_2_pool: Token;
    let token1_2_pool: Token;
    let token0_3_pool: Token;
    let token1_3_pool: Token;
    let token2_3_pool: Token;
    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;
    const wROSEAddress = "0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94";

    before(async () => {
        //deploy 2 tokens 
        let stROSEfac = await ethers.getContractFactory("Token");
        let pROSEfac = await ethers.getContractFactory("Token");

        stROSE = await stROSEfac.deploy("stROSE", "stROSE", 18);
        let txmint1 = await stROSE.mint(process.env.PUBLIC_KEY, 1e10);
        await txmint1.wait();
        pROSE = await pROSEfac.deploy("pROSE", "pROSE", 18);
        let txmint2 = await pROSE.mint(process.env.PUBLIC_KEY, 1e10);
        await txmint2.wait();
        wROSE = await ethers.getContractAt("ERC20", wROSEAddress);

        //deploy 3Info,2Info and swapInfo contract
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
         

        //create wROSE and stROSE pool 
        let txCreate2Pair = await stableSwapFactory.createSwapPair(wROSE.address, stROSE.address, A, Fee, AdminFee, await getOption());
        await txCreate2Pair.wait();
        let info_2 = await stableSwapFactory.getPairInfo(wROSE.address, stROSE.address);
        //get wROSE and stROSE pool information 
        stableSwap2Pool_wROSE_stROSE = await ethers.getContractAt("StableSwapTwoPool", info_2.swapContract);
        token0_2_pool= await ethers.getContractAt("Token",info_2.token0);
        token1_2_pool=await ethers.getContractAt("Token",info_2.token1);
        //add liquidity
        const token0_2_pool_amount=1000000n;
        const token1_2_pool_amount=1000000n;
        let txToken0_2App = await token0_2_pool.approve(stableSwap2Pool_wROSE_stROSE.address,token0_2_pool_amount);
        await txToken0_2App.wait();
        let txToken1_2App = await token1_2_pool.approve(stableSwap2Pool_wROSE_stROSE.address,token1_2_pool_amount);
        await txToken1_2App.wait();
        const txAddLiquidity = await stableSwap2Pool_wROSE_stROSE.add_liquidity([token0_2_pool_amount, token1_2_pool_amount], 0, await getOption());
        await txAddLiquidity.wait();

        //create stROSE and pROSE and wROSE pool  
        let txCreate3Pool = await stableSwapFactory.createThreePoolPair(stROSE.address, pROSE.address, wROSE.address, A, Fee, AdminFee, await getOption());
        await txCreate3Pool.wait();
        let info_3 = await stableSwapFactory.getThreePoolPairInfo(stROSE.address, pROSE.address);
        //get stROSE and pROSE, wROSE  pool information
        stableSwap3Pool_stROSE_pROSE_wROSE = await ethers.getContractAt("StableSwapThreePool", info_3.swapContract);
        token0_3_pool= await ethers.getContractAt("Token",info_3.token0);
        token1_3_pool=await ethers.getContractAt("Token",info_3.token1);
        token2_3_pool=await ethers.getContractAt("Token",info_3.token2);
        ////add liquidity
        const token0_3_pool_amount=1000000n;
        const token1_3_pool_amount=1000000n;
        const token2_3_pool_amount=1000000n;
        let txToken0_3App = await token0_2_pool.approve(stableSwap3Pool_stROSE_pROSE_wROSE.address,token0_3_pool_amount );
        await txToken0_3App.wait();
        let txToken1_3App = await token1_3_pool.approve(stableSwap3Pool_stROSE_pROSE_wROSE.address,token1_3_pool_amount );
        await txToken1_3App.wait();
        let txToken2_3App = await token2_3_pool.approve(stableSwap3Pool_stROSE_pROSE_wROSE.address,token2_3_pool_amount );
        await txToken2_3App.wait();
        const txAddLiquidity2 = await stableSwap3Pool_stROSE_pROSE_wROSE.add_liquidity([token0_3_pool_amount, token1_3_pool_amount, token2_3_pool_amount],0, await getOption());
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


    
    it("exac input swap: swap 1000 stROSE-> wROSE on two pool", async () => {
        const stROSE_balances_before = await stROSE.balanceOf(process.env.PUBLIC_KEY);        
        const ROSE_balances_before = await waffle.provider.getBalance(process.env.PUBLIC_KEY!);
                
        const swap_amount=1000n;

        let txx = await stROSE.approve(stableSwapRouter.address, swap_amount, await getOption());
        const receipt1 =await txx.wait();
        let gasUsed1 = BigNumber.from(receipt1.gasUsed).mul(txx.gasPrice);
        
        const tx = await stableSwapRouter.exactInputStableSwap([stROSE.address, wROSE.address], [2], swap_amount, 0, process.env.PUBLIC_KEY, await getOption());
        const receipt = await tx.wait();
        let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice);        
        
        const stROSE_balances_after = await stROSE.balanceOf(process.env.PUBLIC_KEY);
        const ROSE_balances_after = await waffle.provider.getBalance(process.env.PUBLIC_KEY!);
        
        console.log("Exchanged stROSE amount: ", BigNumber.from(stROSE_balances_before).sub(stROSE_balances_after));
        console.log("Exchanged ROSE amount: ", BigNumber.from(ROSE_balances_after).sub(ROSE_balances_before).add(gasUsed).add(gasUsed1));
    })

    it("exac input swap: swap 1000 wROSE-> stROSE on two pool", async () => {

        const stROSE_balances_before = await stROSE.balanceOf(process.env.PUBLIC_KEY);        
        const ROSE_balances_before = await waffle.provider.getBalance(process.env.PUBLIC_KEY!);
        const swap_amount=1000n;
        const options = await getOption();
        const tx = await stableSwapRouter.exactInputStableSwap([wROSE.address, stROSE.address], [2], swap_amount, 0, process.env.PUBLIC_KEY,{value: swap_amount, gasPrice: options.gasPrice});
        const receipt = await tx.wait();
        let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice);
        const stROSE_balances_after = await stROSE.balanceOf(process.env.PUBLIC_KEY);
        const ROSE_balances_after = await waffle.provider.getBalance(process.env.PUBLIC_KEY!);
        console.log("Exchanged ROSE amount: ", BigNumber.from(ROSE_balances_before).sub(ROSE_balances_after).sub(gasUsed));
        console.log("Received stROSE amount: ", BigNumber.from(stROSE_balances_after).sub(stROSE_balances_before));
    })
    
    it("exac input swap 1000 stROSE-> wROSE in two pool and swap wROSE amount-> pROSE in three pool", async () => {

        const stROSE_balances_before = await stROSE.balanceOf(process.env.PUBLIC_KEY);        
        const pROSE_balances_before = await pROSE.balanceOf(process.env.PUBLIC_KEY);        

        const swap_amount=1000n;

        let txx = await stROSE.approve(stableSwapRouter.address, swap_amount, await getOption());
        await txx.wait();

        const tx = await stableSwapRouter.exactInputStableSwap([stROSE.address, wROSE.address, pROSE.address], [2,3], swap_amount, 0, process.env.PUBLIC_KEY, await getOption());
        await tx.wait();
        
        const stROSE_balances_after = await stROSE.balanceOf(process.env.PUBLIC_KEY);
        const pROSE_balances_after = await pROSE.balanceOf(process.env.PUBLIC_KEY);        
        
        console.log("Exchanged stROSE amount: ", BigNumber.from(stROSE_balances_before).sub(stROSE_balances_after));
        console.log("Exchanged pROSE amount: ", BigNumber.from(pROSE_balances_after).sub(pROSE_balances_before));
    })

    it("get stROSE to  be needed to get 100000 wROSE when you swap stROSE -> wROSE in 2 pool ", async () => {

        const swap_amount=100000n;
        const maximum_exchanged_amount=10000000n;

        const tx = await stableSwapRouter.getInputStableSwap([stROSE.address, wROSE.address], [2], swap_amount, maximum_exchanged_amount)
        console.log("amount: ", tx);
    })

    it("get stROSE to  be needed to get 100000 pROSE when you swap stROSE -> wROSE in 2 pool  and wROSE->pROSE in 3 pool", async () => {

        const swap_amount=100000n;
        const maximum_exchanged_amount=10000000n;

        const tx = await stableSwapRouter.getInputStableSwap([stROSE.address, wROSE.address, pROSE.address], [2, 3], swap_amount, maximum_exchanged_amount)
        console.log("amount: ", tx);
    })


    it("get output if swap 100000n stROSE-> wROSE in two pool and swap wROSE amount-> pROSE in three pool ", async () => {

        const swap_amount=100000n;
        const min_redeem_amount=0n;

        const tx = await stableSwapRouter.getOutputStableSwap([stROSE.address, wROSE.address, pROSE.address], [2,3], swap_amount, min_redeem_amount)
        console.log("amount: ", tx);
    })
})