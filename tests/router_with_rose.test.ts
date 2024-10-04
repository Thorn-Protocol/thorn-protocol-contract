import { deployments, ethers } from "hardhat";
import * as hre from "hardhat";
import * as dotenv from "dotenv";
import {
    ERC20,
    StableSwapFactory,
    StableSwapInfo,
    StableSwapLPFactory,
    StableSwapRouter,
    StableSwapThreePool,
    StableSwapThreePoolDeployer,
    StableSwapThreePoolInfo,
    StableSwapTwoPool,
    StableSwapTwoPoolDeployer,
    StableSwapTwoPoolInfo,
    Token,
    WNATIVE,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import fs from "fs";
import path from "path";
import { BigNumber } from "ethers";
import { expect } from "chai";
dotenv.config();

describe("test router", function () {
    this.timeout(1500000);
    let stableSwapRouter: StableSwapRouter;
    let stableSwapTwoDeployer: StableSwapTwoPoolDeployer;
    let stableSwapThreeDeployer: StableSwapThreePoolDeployer;
    let stableSwap2Pool_ROSE_pROSE: StableSwapTwoPool;
    let stableSwap2Pool_ROSE_stROSE: StableSwapTwoPool;
    let stableSwapLPFactory: StableSwapLPFactory;
    let stableSwapInfo: StableSwapInfo;
    let stableSwap3Info: StableSwapThreePoolInfo;
    let stableSwap2Info: StableSwapTwoPoolInfo;
    let stableSwapFactory: StableSwapFactory;
    let stROSE: Token;
    let pROSE: Token;
    let RoseIndex_1: number;
    let RoseIndex_2: number;
    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;
    let accounts: SignerWithAddress[];
    let ROSE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    let WROSE: WNATIVE;
    let ADD_AMOUNT = ethers.utils.parseUnits("1000", 18);
    let ADD_AMOUNT_1 = ethers.utils.parseUnits("10", 18);
    let ADD_AMOUNT_2 = ethers.utils.parseUnits("5", 18);

    before(async () => {
        accounts = await ethers.getSigners();

        // Deploy 2 tokens
        const stROSEfac = await ethers.getContractFactory("Token");
        const pROSEfac = await ethers.getContractFactory("Token");

        stROSE = (await stROSEfac.deploy("stROSE", "stROSE", 18)) as unknown as Token;
        await (await stROSE.mint(accounts[0].address, ADD_AMOUNT.mul(10))).wait();

        pROSE = (await pROSEfac.deploy("pROSE", "pROSE", 18)) as unknown as Token;
        await (await pROSE.mint(accounts[0].address, ADD_AMOUNT.mul(10))).wait();

        // Deploy 3Info, 2Info, and swapInfo contracts
        const stableSwapThreePoolInfoFactory = await ethers.getContractFactory("StableSwapThreePoolInfo");
        stableSwap3Info = (await stableSwapThreePoolInfoFactory.deploy()) as unknown as StableSwapThreePoolInfo;

        const stableSwapTwoPoolInfoFactory = await ethers.getContractFactory("StableSwapTwoPoolInfo");
        stableSwap2Info = (await stableSwapTwoPoolInfoFactory.deploy()) as unknown as StableSwapTwoPoolInfo;

        const stableSwapInfoFactory = await ethers.getContractFactory("StableSwapInfo");
        stableSwapInfo = (await stableSwapInfoFactory.deploy(
            stableSwap2Info.address,
            stableSwap3Info.address
        )) as unknown as StableSwapInfo;

        // Deploy 3Deployer, 2Deployer, and LP contracts
        const stableSwapThreePoolDeployerFactory = await ethers.getContractFactory("StableSwapThreePoolDeployer");
        stableSwapThreeDeployer =
            (await stableSwapThreePoolDeployerFactory.deploy()) as unknown as StableSwapThreePoolDeployer;

        const stableSwapTwoPoolDeployerFactory = await ethers.getContractFactory("StableSwapTwoPoolDeployer");
        stableSwapTwoDeployer =
            (await stableSwapTwoPoolDeployerFactory.deploy()) as unknown as StableSwapTwoPoolDeployer;

        const stableSwapLPFactory_FC = await ethers.getContractFactory("StableSwapLPFactory");
        stableSwapLPFactory = (await stableSwapLPFactory_FC.deploy()) as unknown as StableSwapLPFactory;
        await stableSwapLPFactory.deployed();

        // Deploy StableSwapFactory contract
        const { deploy } = deployments;
        const [deployer] = await hre.getUnnamedAccounts();
        console.log(deployer);

        const tx_stable_swap_factory = await deploy("StableSwapFactory", {
            from: deployer,
            proxy: {
                owner: deployer,
                execute: {
                    init: {
                        methodName: "initialize",
                        args: [
                            stableSwapLPFactory.address,
                            stableSwapTwoDeployer.address,
                            stableSwapThreeDeployer.address,
                            accounts[0].address,
                        ],
                    },
                },
            },
            log: true,
            skipIfAlreadyDeployed: false,
        });

        stableSwapFactory = (await ethers.getContractAt(
            "StableSwapFactory",
            tx_stable_swap_factory.address
        )) as unknown as StableSwapFactory;

        // Transfer ownership to StableSwapFactory
        await (await stableSwapLPFactory.transferOwnership(stableSwapFactory.address)).wait();
        await (await stableSwapTwoDeployer.transferOwnership(stableSwapFactory.address)).wait();
        await (await stableSwapThreeDeployer.transferOwnership(stableSwapFactory.address)).wait();

        // Create ROSE and stROSE pool
        await (await stableSwapFactory.createSwapPair(ROSE, stROSE.address, A, Fee, AdminFee)).wait();

        const info_2 = await stableSwapFactory.getPairInfo(ROSE, stROSE.address);

        // Get ROSE and stROSE pool information
        stableSwap2Pool_ROSE_stROSE = (await ethers.getContractAt(
            "StableSwapTwoPool",
            info_2.swapContract
        )) as unknown as StableSwapTwoPool;

        if (info_2.token0 == ROSE) {
            RoseIndex_1 = 0;
        } else {
            RoseIndex_1 = 1;
        }

        // Add liquidity
        await (await stROSE.approve(stableSwap2Pool_ROSE_stROSE.address, ADD_AMOUNT)).wait();
        await (
            await stableSwap2Pool_ROSE_stROSE.add_liquidity([ADD_AMOUNT, ADD_AMOUNT], 0, { value: ADD_AMOUNT })
        ).wait();

        console.log("add liquidity success");

        // Create ROSE and pROSE pool
        await (await stableSwapFactory.createSwapPair(ROSE, pROSE.address, A, Fee, AdminFee)).wait();
        const info_1 = await stableSwapFactory.getPairInfo(ROSE, pROSE.address);

        // Get ROSE and pROSE pool information
        stableSwap2Pool_ROSE_pROSE = (await ethers.getContractAt(
            "StableSwapTwoPool",
            info_1.swapContract
        )) as unknown as StableSwapTwoPool;
        if (info_1.token0 == ROSE) {
            RoseIndex_2 = 0;
        } else {
            RoseIndex_2 = 1;
        }

        // Add liquidity
        await (await pROSE.approve(stableSwap2Pool_ROSE_pROSE.address, ADD_AMOUNT)).wait();
        await (
            await stableSwap2Pool_ROSE_pROSE.add_liquidity([ADD_AMOUNT, ADD_AMOUNT], 0, { value: ADD_AMOUNT })
        ).wait();

        // Create smart contract router
        const SmartRouterHelperFactory = await ethers.getContractFactory("SmartRouterHelper");
        const SmartRouterHelperContract = await SmartRouterHelperFactory.deploy();
        console.log("deploy router1");
        const stableSwapRouterFactory = await ethers.getContractFactory("StableSwapRouter", {
            libraries: {
                SmartRouterHelper: SmartRouterHelperContract.address,
            },
        });

        console.log("deploy router2");
        stableSwapRouter = (await stableSwapRouterFactory.deploy(
            stableSwapFactory.address,
            stableSwapInfo.address
        )) as unknown as StableSwapRouter;
    });
    after(() => {
        const deploymentFolder = path.join(__dirname, "../deployments");
        if (fs.existsSync(deploymentFolder)) {
            fs.rmdirSync(deploymentFolder, { recursive: true });
            console.log("Deployment folder removed.");
        } else {
            console.log("Deployment folder does not exist.");
        }
    });

    it("should get corrrect ROSE after swapping ROSE to stROSE and vice versa", async () => {
        let before_stROSE: BigNumber = await stROSE.balanceOf(accounts[0].address);

        await expect(
            stableSwapRouter.exactInputStableSwap([ROSE, stROSE.address], [2], ADD_AMOUNT_1, 0, accounts[0].address, {
                value: ADD_AMOUNT_1.div(2),
            })
        ).to.be.reverted;

        await (
            await stableSwapRouter.exactInputStableSwap(
                [ROSE, stROSE.address],
                [2],
                ADD_AMOUNT_1,
                0,
                accounts[0].address,
                { value: ADD_AMOUNT_1 }
            )
        ).wait();

        let after_stROSE: BigNumber = await stROSE.balanceOf(accounts[0].address);

        expect(after_stROSE.sub(before_stROSE)).to.be.closeTo(ADD_AMOUNT_1, ADD_AMOUNT_1.mul(6).div(10000));

        let before_ROSE: BigNumber = await ethers.provider.getBalance(accounts[0].address);

        await (await stROSE.approve(stableSwapRouter.address, ADD_AMOUNT_1)).wait();
        let tx = await stableSwapRouter.exactInputStableSwap(
            [stROSE.address, ROSE],
            [2],
            ADD_AMOUNT_1,
            0,
            accounts[0].address
        );
        const receipt = await tx.wait();
        let gasUsed = BigNumber.from(receipt.gasUsed).mul(tx.gasPrice!);
        console.log("gas used: ", gasUsed.toString());

        let after_ROSE: BigNumber = await ethers.provider.getBalance(accounts[0].address);

        expect(after_ROSE.sub(before_ROSE)).to.be.closeTo(ADD_AMOUNT_1.sub(gasUsed), ADD_AMOUNT_1.mul(6).div(10000));
    });

    it("should get correct stROSE after swapping stROSE to pROSE and vice versa", async () => {
        let p_Rose_before = await pROSE.balanceOf(accounts[0].address);
        await (await stROSE.approve(stableSwapRouter.address, ADD_AMOUNT_1)).wait();
        await (
            await stableSwapRouter.exactInputStableSwap(
                [stROSE.address, ROSE, pROSE.address],
                [2, 2],
                ADD_AMOUNT_1,
                0,
                accounts[0].address
            )
        ).wait();
        let p_ROSE_after = await pROSE.balanceOf(accounts[0].address);

        expect(p_ROSE_after.sub(p_Rose_before)).to.be.closeTo(ADD_AMOUNT_1, ADD_AMOUNT_1.div(800));
    });

    it("should get the correct amount out and in", async () => {
        let amountOut = await stableSwapRouter.getOutputStableSwap([ROSE, stROSE.address], [2], ADD_AMOUNT_2, 0);
        expect(amountOut).to.be.closeTo(ADD_AMOUNT_2, ADD_AMOUNT_2.mul(6).div(10000));

        amountOut = await stableSwapRouter.getOutputStableSwap([stROSE.address, ROSE], [2], ADD_AMOUNT_2, 0);
        expect(amountOut).to.be.closeTo(ADD_AMOUNT_2, ADD_AMOUNT_2.mul(6).div(10000));

        amountOut = await stableSwapRouter.getOutputStableSwap(
            [stROSE.address, ROSE, pROSE.address],
            [2, 2],
            ADD_AMOUNT_2,
            0
        );
        expect(amountOut).to.be.closeTo(ADD_AMOUNT_2, ADD_AMOUNT_2.div(800));

        let amountIn = await stableSwapRouter.getInputStableSwap(
            [stROSE.address, ROSE, pROSE.address],
            [2, 2],
            ADD_AMOUNT_2,
            ADD_AMOUNT
        );
        expect(amountIn).to.be.closeTo(ADD_AMOUNT_2, ADD_AMOUNT_2.div(800));

        amountIn = await stableSwapRouter.getInputStableSwap([ROSE, stROSE.address], [2], ADD_AMOUNT_2, ADD_AMOUNT);
        expect(amountIn).to.be.closeTo(ADD_AMOUNT_2, ADD_AMOUNT_2.mul(6).div(10000));

        amountIn = await stableSwapRouter.getInputStableSwap([stROSE.address, ROSE], [2], ADD_AMOUNT_2, ADD_AMOUNT);
        expect(amountIn).to.be.closeTo(ADD_AMOUNT_2, ADD_AMOUNT_2.mul(6).div(10000));
    });
});
