import { StableSwapRouter } from "./../typechain-types/contracts/StableSwapRouter";
import hre, { network } from "hardhat";
import {
    ERC20,
    ERC2Mintable,
    ERC2Mintable__factory,
    StableSwapFactory,
    StableSwapFactory__factory,
    StableSwapLP,
    StableSwapLP__factory,
    StableSwapLPFactory,
    StableSwapLPFactory__factory,
    StableSwapRouter__factory,
    StableSwapTwoPool,
    StableSwapTwoPool__factory,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { formatEther, parseEther, ZeroAddress } from "ethers";
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";
import { erc20MintableSol } from "../typechain-types/contracts/mocks";

describe("ROSE-stROSE test", () => {
    if (network.config.chainId != 31337) {
        throw new Error("Test must be run on localhost");
    }

    let lpFactory: StableSwapLPFactory;
    let stableSwapFactory: StableSwapFactory;
    let deployer: HardhatEthersSigner;
    let bob: HardhatEthersSigner;
    let alice: HardhatEthersSigner;
    let pool2: StableSwapTwoPool;
    let token0: ERC2Mintable;
    let token1: ERC2Mintable;
    let router: StableSwapRouter;
    let lp: StableSwapLP;
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
        const pool2Deployment = await get("Pool2");
        pool2 = StableSwapTwoPool__factory.connect(pool2Deployment.address, provider);
        const routerDeployment = await get("StableSwapRouter");
        router = StableSwapRouter__factory.connect(routerDeployment.address, provider);
        console.log(pool2Deployment.devdoc);
        lp = StableSwapLP__factory.connect(pool2Deployment.devdoc.LP, provider);
        const tokenODeploymeny = await get("TKN4");
        const token1Deploymeny = await get("TKN5");

        token0 = ERC2Mintable__factory.connect(tokenODeploymeny.address, deployer);
        token1 = ERC2Mintable__factory.connect(token1Deploymeny.address, deployer);
        const amount = parseEther("10000000");
        await token0.mint(deployer.address, amount);
        await token1.mint(deployer.address, amount);
        await token0.mint(bob.address, amount);
        await token1.mint(bob.address, amount);
        await token0.mint(alice.address, amount);
        await token1.mint(alice.address, amount);
    });

    const swap = async (user: HardhatEthersSigner, amount, route: Number) => {
        await token0.connect(user).approve(await router.getAddress(), amount);
        await token1.connect(user).approve(await router.getAddress(), amount);
        const path = [await token0.getAddress(), await token1.getAddress()];
        if (route == 0) {
            path.reverse();
        }
        await router.connect(user).exactInputStableSwap(path, [2], amount, 0, user.address);
    };

    const add_liquidity = async (user: HardhatEthersSigner, amount0, amount1) => {
        await token0.connect(user).approve(await pool2.getAddress(), amount0);
        await token1.connect(user).approve(await pool2.getAddress(), amount1);
        await pool2.connect(user).add_liquidity([amount0, amount1], 0);
    };

    const getBalance = async (name: string, address: string) => {
        let balance = await lp.balanceOf(address);
        console.log("INFORMATION".info, name.info);
        console.log("balance LP", formatEther(balance));
        balance = await token0.balanceOf(address);
        console.log("balance token0 ", formatEther(balance));
        balance = await token1.balanceOf(address);
        console.log("balance token1 ", formatEther(balance));

        balance = (await token0.balanceOf(address)) + (await token1.balanceOf(address));
        console.log("balance token0 + token1 = ", formatEther(balance));
    };
    it("Drug pool", async () => {
        await add_liquidity(deployer, parseEther("1"), parseEther("1"));
        console.log("deployer balance");
        await add_liquidity(bob, parseEther("259358.165"), parseEther("913779.380"));
        // await getBalance("pool before swap", await pool2.getAddress());
        await getBalance(" ALICE BEFORE", alice.address);
        await getBalance(" BOB BEFORE", bob.address);
        await swap(alice, parseEther("259359.165"), 0);
        await getBalance(" BOB AFTER", bob.address);
        //   await getBalance("pool after swap", await pool2.getAddress());
        await swap(alice, parseEther("10"), 1);
        await getBalance(" ALICE AFTER", alice.address);
        await swap(alice, parseEther("10"), 1);
        await getBalance(" ALICE AFTER", alice.address);
        await swap(alice, parseEther("10"), 1);
        await getBalance(" ALICE AFTER", alice.address);
        await getBalance(" BOB AFTER", await pool2.getAddress());
        // await getBalance("pool", await pool2.getAddress());
    });
});
