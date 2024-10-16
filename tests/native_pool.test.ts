import { TOKEN_TESTNET } from "./../src/config";
import hre from "hardhat";
import { HardhatEthersSigner, SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { deployments, network } from "hardhat";
import {
    StableSwapFactory,
    StableSwapFactory__factory,
    StableSwapLP,
    StableSwapLP__factory,
    StableSwapLPFactory,
    StableSwapLPFactory__factory,
    StableSwapRouter,
    StableSwapRouter__factory,
    StableSwapTwoPool,
    StableSwapTwoPool__factory,
    StROSE,
    StROSE__factory,
} from "../typechain-types";
import { parseEther } from "ethers";
import { expect } from "chai";

describe("Native pool ROSE-stROSE Contract Tests", function () {
    if (network.config.chainId != 31337) {
        throw new Error("Test must be run on localhost");
    }

    let deployer: HardhatEthersSigner;
    let bob: HardhatEthersSigner;
    let alice: HardhatEthersSigner;

    let stableSwapFactory: StableSwapFactory;
    let pool: StableSwapTwoPool;
    let router: StableSwapRouter;
    let lp: StableSwapLP;
    let stROSE: StROSE;

    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;

    let ROSE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

    const { deployments, getNamedAccounts } = hre;
    const { get, execute, read } = deployments;
    const provider = hre.ethers.provider;

    beforeEach(async function () {
        await deployments.fixture();
        deployer = await hre.ethers.provider.getSigner(0);
        bob = await hre.ethers.provider.getSigner(1);
        alice = await hre.ethers.provider.getSigner(2);
        const lpFactoryDeployment = await get("StableSwapLPFactory");
        const stableSwapFactoryDeployment = await get("StableSwapFactory");
        stableSwapFactory = StableSwapFactory__factory.connect(stableSwapFactoryDeployment.address, provider);

        // rose pool
        const poolROSE_stROSEDeployment = await get("pool_ROSE-stROSE");
        pool = StableSwapTwoPool__factory.connect(poolROSE_stROSEDeployment.address, provider);

        // router
        const routerDeployment = await get("StableSwapRouter");
        router = StableSwapRouter__factory.connect(routerDeployment.address, provider);

        // rose
        const stROSEDeployment = await get("stROSE");
        stROSE = StROSE__factory.connect(stROSEDeployment.address, provider);

        const info = await stableSwapFactory.getPairInfo(ROSE, stROSEDeployment.address);

        // console.log("info", info);

        lp = StableSwapLP__factory.connect(info[3], provider);
        await stROSE.connect(deployer).mint(alice.address, parseEther("1000"));
    });

    describe("When liquiditiy = 0", async () => {
        it(" check ", async () => {});
    });

    describe("When liquiditiy > 0", async () => {
        this.beforeEach(async () => {
            await stROSE.connect(alice).approve(await pool.getAddress(), parseEther("100"));
            await pool.connect(alice).add_liquidity([parseEther("100"), parseEther("100")], 0, {
                value: parseEther("100"),
            });
        });

        it(" check liquidity alice != 0", async () => {
            const balance = await lp.balanceOf(alice.address);
            expect(balance).greaterThan(0);
        });
    });

    it("Swap token0 to token1", async () => {});
});
