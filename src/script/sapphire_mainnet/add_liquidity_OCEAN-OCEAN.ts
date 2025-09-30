import hre from "hardhat";

import { formatUnits, parseUnits } from "ethers";
import { ERC20__factory, StableSwapFactory__factory } from "../../../typechain-types";
import { StableSwapTwoPool__factory } from "../../../typechain-types/factories/contracts/stableSwap/plain-pools/StableSwapTwoPool__factory";
import { addresses } from "../../utils/addresses";
import { StableSwapLP__factory } from "../../../typechain-types/factories/contracts/stableSwap/StableSwapLP__factory";

async function add_liquidity_tethUSDT_ThornUSD() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    const OCEANRouter = ERC20__factory.connect(addresses.OCEAN.Router, hre.ethers.provider);
    const OCEANCeler = ERC20__factory.connect(addresses.OCEAN.Celer, hre.ethers.provider);
    const poolDeployment = await get("pool_OCEAN-OCEAN");
    const pool = StableSwapTwoPool__factory.connect(poolDeployment.address, hre.ethers.provider);
    const lpAddress = await pool.token();
    const lp = StableSwapLP__factory.connect(lpAddress, hre.ethers.provider);
    let balance_lp = await lp.balanceOf(deployer);
    console.log("balance_lp", formatUnits(balance_lp, 18));

    const minterLP = await lp.minter();
    console.log("minter lp", minterLP);

    console.log(" pool ", poolDeployment.address);
    const token0 = await pool.coins(0);
    const token1 = await pool.coins(1);
    console.log("token0", token0);
    console.log("token1", token1);
    console.log("Ocean Router: ", await OCEANRouter.getAddress());
    console.log("Ocean Celer: ", await OCEANCeler.getAddress());

    const factoryDeployment = await get("StableSwapFactory");
    const factory = StableSwapFactory__factory.connect(factoryDeployment.address, hre.ethers.provider);

    const poolx = await factory.getPairInfo(token0, token1);
    console.log("poolx", poolx);

    if (balance_lp < parseUnits("0.1", 18)) {
        let amountA = parseUnits("0.01", 18);
        let txRespone, txReceipt;
        console.log(" appove OCEAN Router");
        const balance = await OCEANRouter.balanceOf(deployer);
        console.log("balance OCEAN Router", formatUnits(balance, 18));
        txRespone = await OCEANRouter.connect(deployer2).approve(poolDeployment.address, amountA);
        txReceipt = await txRespone.wait();

        console.log(" appove Ocean Celer");
        let amountB = parseUnits("0.01", 18);
        const balance2 = await OCEANCeler.balanceOf(deployer);
        console.log("balance Ocean Celer", formatUnits(balance2, 18));
        txRespone = await OCEANCeler.connect(deployer2).approve(poolDeployment.address, amountB);
        txReceipt = await txRespone.wait();
        if ((await OCEANRouter.getAddress()) < (await OCEANCeler.getAddress())) {
            [amountA, amountB] = [amountA, amountB];
        } else {
            [amountA, amountB] = [amountB, amountA];
        }
        console.log("add_liquidity ", amountA, amountB);
        txRespone = await pool.connect(deployer2).add_liquidity([amountA, amountB], 0);
        txReceipt = await txRespone.wait();
        balance_lp = await lp.balanceOf(deployer);
        console.log("balance_lp", formatUnits(balance_lp, 18));
    }
}

add_liquidity_tethUSDT_ThornUSD();
