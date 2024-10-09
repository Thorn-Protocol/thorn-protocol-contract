import hre, { ethers, network } from "hardhat";
import {
    StableSwapFactory,
    StableSwapFactory__factory,
    StableSwapLP,
    StableSwapLP__factory,
    StableSwapLPFactory,
    StableSwapLPFactory__factory,
    StableSwapThreePool,
    StableSwapThreePool__factory,
    StableSwapTwoPool,
    StableSwapTwoPool__factory,
    TKN1,
    TKN1__factory,
    TKN2,
    TKN3,
    USDC,
    USDC__factory,
    USDT,
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { formatUnits, parseUnits, ZeroAddress } from "ethers";

describe("issue test", () => {
    if (network.config.chainId != 31337) {
        throw new Error("Test must be run on localhost");
    }

    let lpFactory: StableSwapLPFactory;
    let stableSwapFactory: StableSwapFactory;
    let deployer: HardhatEthersSigner;
    let bob: HardhatEthersSigner;
    let alice: HardhatEthersSigner;

    let pool: StableSwapTwoPool;

    let pool3: StableSwapThreePool;

    let usdc: USDC;
    let usdt: USDT;

    let tkn1: TKN1;
    let tkn2: TKN2;
    let tkn3: TKN3;

    let lp: StableSwapLP;

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

        const usdcDeployment = await get("USDC");
        usdc = USDC__factory.connect(usdcDeployment.address, provider);

        const usdtDeployment = await get("USDT");
        usdt = USDC__factory.connect(usdtDeployment.address, provider);

        const tkn1Deployment = await get("TKN1");
        tkn1 = TKN1__factory.connect(tkn1Deployment.address, provider);

        const tkn2Deployment = await get("TKN2");
        tkn2 = TKN1__factory.connect(tkn2Deployment.address, provider);

        const tkn3Deployment = await get("TKN3");
        tkn3 = TKN1__factory.connect(tkn3Deployment.address, provider);

        const poolDeployment = await get("Pool_USDT_USDC");
        pool = StableSwapTwoPool__factory.connect(poolDeployment.address, provider);

        const pool3Deployment = await get("Pool3");
        pool3 = StableSwapThreePool__factory.connect(pool3Deployment.address, provider);

        const lpDeployment = await pool.token();
        lp = StableSwapLP__factory.connect(lpDeployment, provider);
    });

    it(" issue #64 ", async () => {
        await usdc.connect(alice).mint(await alice.getAddress(), parseUnits("100", 6));
        await usdt.connect(alice).mint(await alice.getAddress(), parseUnits("100", 6));
        await usdc.connect(bob).mint(await bob.getAddress(), parseUnits("100", 6));
        await usdt.connect(bob).mint(await bob.getAddress(), parseUnits("100", 6));

        await usdc.connect(alice).approve(await pool.getAddress(), parseUnits("100", 6));
        await usdt.connect(alice).approve(await pool.getAddress(), parseUnits("1", 6));

        await expect(pool.calc_token_amount([parseUnits("100", 6), parseUnits("1", 6)], true)).to.be.reverted;

        await pool.connect(alice).add_liquidity([parseUnits("100", 6), parseUnits("1", 6)], 0);

        const lp_alice = await lp.balanceOf(await alice.getAddress());
        console.log("lp_alice", formatUnits(lp_alice.toString(), 18));

        await usdc.connect(bob).approve(await pool.getAddress(), parseUnits("50", 6));
        await usdt.connect(bob).approve(await pool.getAddress(), parseUnits("50", 6));

        const lp_estimate = await pool.calc_token_amount([parseUnits("50", 6), parseUnits("50", 6)], true);

        console.log("lp_estimate", formatUnits(lp_estimate, 18));

        await pool.connect(bob).add_liquidity([parseUnits("50", 6), parseUnits("50", 6)], 0);

        const lp_bob = await lp.balanceOf(await bob.getAddress());
        console.log("lp_bob", formatUnits(lp_bob.toString(), 18));

        const usdc_alice_before = await usdc.balanceOf(await alice.getAddress());
        const usdt_alice_before = await usdt.balanceOf(await alice.getAddress());
        await pool.connect(alice).remove_liquidity(lp_alice, [0, 0]);

        const usdc_alice_after = await usdc.balanceOf(await alice.getAddress());
        const usdt_alice_after = await usdt.balanceOf(await alice.getAddress());

        console.log("usdc receive ", formatUnits(usdc_alice_after - usdc_alice_before, 6));
        console.log("usdt receive ", formatUnits(usdt_alice_after - usdt_alice_before, 6));

        const usdc_bob_before = await usdc.balanceOf(await bob.getAddress());
        const usdt_bob_before = await usdt.balanceOf(await bob.getAddress());

        await pool.connect(bob).remove_liquidity(lp_bob, [0, 0]);

        const usdc_bob_after = await usdc.balanceOf(await bob.getAddress());
        const usdt_bob_after = await usdt.balanceOf(await bob.getAddress());

        console.log("usdc receive ", formatUnits(usdc_bob_after - usdc_bob_before, 6));
        console.log("usdt receive ", formatUnits(usdt_bob_after - usdt_bob_before, 6));
    });

    it("issue#65", async () => {
        await tkn1.connect(alice).mint(await alice.getAddress(), parseUnits("100", 18));
        await tkn2.connect(alice).mint(await alice.getAddress(), parseUnits("100", 18));
        await tkn3.connect(alice).mint(await alice.getAddress(), parseUnits("100", 18));
        await tkn1.connect(alice).approve(await pool3.getAddress(), parseUnits("100", 18));
        await tkn2.connect(alice).approve(await pool3.getAddress(), parseUnits("100", 18));
        await tkn3.connect(alice).approve(await pool3.getAddress(), parseUnits("100", 18));
        await pool3
            .connect(alice)
            .add_liquidity([parseUnits("100", 18), parseUnits("100", 18), parseUnits("100", 18)], 0);
        let failedWithdrawals = 0;
        let successfulWithdrawals = 0;
        for (let i = 0; i < 100; i++) {
            try {
                await pool3.connect(alice).remove_liquidity_one_coin(1, 0, 0);
                successfulWithdrawals++;
            } catch (e) {
                failedWithdrawals++;
            }
        }
        console.log("successfulWithdrawals", successfulWithdrawals);
        console.log("failedWithdrawals", failedWithdrawals);
    });
});
