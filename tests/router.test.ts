import { StROSE } from "./../typechain-types/contracts/mocks/StROSE";
import { CHAIN_ID } from "./../src/utils/network";
import * as dotenv from "dotenv";
import { deployments, ethers, network } from "hardhat";
import {
    ERC20,
    ERC20__factory,
    StableSwapFactory,
    StableSwapFactory__factory,
    StableSwapLPFactory,
    StableSwapLPFactory__factory,
    StableSwapRouter,
    StableSwapRouter__factory,
    StableSwapTwoPool,
    StableSwapTwoPool__factory,
    StROSE__factory,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import hre from "hardhat";
import { TOKEN_TESTNET } from "../src/config";
import { formatEther, parseEther } from "ethers";
import { expect } from "chai";
dotenv.config();
describe("test router", function () {
    if (network.config.chainId != 31337) {
        throw new Error("Test must be run on localhost");
    }

    let lpFactory: StableSwapLPFactory;
    let stableSwapFactory: StableSwapFactory;
    let deployer: HardhatEthersSigner;
    let bob: HardhatEthersSigner;
    let alice: HardhatEthersSigner;

    let poolROSE: StableSwapTwoPool;
    let stROSE: StROSE;
    let router: StableSwapRouter;
    let factory: StableSwapFactory;

    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;

    const { deployments, getNamedAccounts } = hre;
    const { get, execute, read } = deployments;
    const provider = ethers.provider;

    before(async () => {
        await deployments.fixture();
        deployer = await hre.ethers.provider.getSigner(0);
        bob = await hre.ethers.provider.getSigner(1);
        alice = await hre.ethers.provider.getSigner(2);
        const lpFactoryDeployment = await get("StableSwapLPFactory");
        const stableSwapFactoryDeployment = await get("StableSwapFactory");
        lpFactory = StableSwapLPFactory__factory.connect(lpFactoryDeployment.address, provider);
        stableSwapFactory = StableSwapFactory__factory.connect(stableSwapFactoryDeployment.address, provider);

        // rose pool
        const poolROSE_stROSEDeployment = await get("pool_ROSE-stROSE");
        poolROSE = StableSwapTwoPool__factory.connect(poolROSE_stROSEDeployment.address, provider);

        // router
        const routerDeployment = await get("StableSwapRouter");
        router = StableSwapRouter__factory.connect(routerDeployment.address, provider);

        // factory
        const factoryDeployment = await get("StableSwapFactory");
        factory = StableSwapFactory__factory.connect(factoryDeployment.address, provider);

        // rose
        const stROSEDeployment = await get("stROSE");
        stROSE = StROSE__factory.connect(stROSEDeployment.address, provider);
    });

    // it("call getAmountOut when non have liquidity", async () => {
    //     // check pool
    //     const info = await factory.getPairInfo(TOKEN_TESTNET.ROSE, await stROSE.getAddress());
    //     console.log(" info ", info);
    //     console.log(" stRose ", await stROSE.getAddress());
    //     const x = await router.getOutputStableSwap([TOKEN_TESTNET.ROSE, await stROSE.getAddress()], [2], 0, 0);
    // });

    it("revert call getAmountOut input = 0 when non have liquidity after addliquidity each 1ETH ", async () => {
        await stROSE.connect(deployer).mint(await deployer.getAddress(), parseEther("100"));
        await stROSE.connect(deployer).approve(await poolROSE.getAddress(), parseEther("1"));

        await poolROSE
            .connect(deployer)
            .add_liquidity([parseEther("1"), parseEther("1.1")], 0, { value: parseEther("1.1") });

        // check pool
        const info = await factory.getPairInfo(TOKEN_TESTNET.ROSE, await stROSE.getAddress());
        console.log(" info ", info);
        console.log(" stRose ", await stROSE.getAddress());
        await expect(router.getOutputStableSwap([TOKEN_TESTNET.ROSE, await stROSE.getAddress()], [2], 0, 0)).to.be
            .reverted;
    });

    // it("success call getAmountOut input = 0.1 when non have liquidity after addliquidity each 1ETH ", async () => {
    //     await stROSE.connect(deployer).mint(await deployer.getAddress(), parseEther("100"));
    //     await stROSE.connect(deployer).approve(await poolROSE.getAddress(), parseEther("1"));

    //     await poolROSE
    //         .connect(deployer)
    //         .add_liquidity([parseEther("1.1"), parseEther("1")], 0, { value: parseEther("1.1") });

    //     // check pool
    //     const info = await factory.getPairInfo(TOKEN_TESTNET.ROSE, await stROSE.getAddress());
    //     console.log(" info ", info);
    //     console.log(" stRose ", await stROSE.getAddress());
    //     const data = await router.getOutputStableSwap(
    //         [TOKEN_TESTNET.ROSE, await stROSE.getAddress()],
    //         [2],
    //         parseEther("2"),
    //         0
    //     );

    //     console.log(" data ", formatEther(data));
    // });
});
