import hre, { ethers, network } from "hardhat";
import {
    StableSwapFactory,
    StableSwapFactory__factory,
    StableSwapLPFactory,
    StableSwapLPFactory__factory,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ZeroAddress } from "ethers";

describe("Factory test", () => {
    if (network.config.chainId != 31337) {
        throw new Error("Test must be run on localhost");
    }

    let lpFactory: StableSwapLPFactory;
    let stableSwapFactory: StableSwapFactory;
    let deployer: HardhatEthersSigner;
    let bob: HardhatEthersSigner;
    let alice: HardhatEthersSigner;

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
    });

    it("revert when call initialize again", async () => {
        await expect(
            stableSwapFactory.connect(deployer).initialize(ZeroAddress, ZeroAddress, ZeroAddress, ZeroAddress)
        ).to.be.revertedWith("Initializable: contract is already initialized");
    });

    it("revert create Swap Pair by not admin", async () => {
        await expect(
            stableSwapFactory.connect(bob).createSwapPair(ZeroAddress, ZeroAddress, A, Fee, AdminFee)
        ).to.be.revertedWith("Admin only");
    });
});
