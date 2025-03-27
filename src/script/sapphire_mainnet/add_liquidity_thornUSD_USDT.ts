import { Token } from "./../../typechain-types/contracts/mocks/Token";
import { ethers } from "hardhat";
import hre from "hardhat";
import {
    ERC20__factory,
    StableSwapFactory__factory,
    StableSwapLP__factory,
    StableSwapTwoPool__factory,
} from "../../typechain-types";
import { formatUnits, parseUnits } from "ethers";
import { TOKEN_MAINNET, TOKEN_TESTNET } from "../config";

async function add_liquidity_tethUSDT_ThornUSD() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    const ThornUSD = ERC20__factory.connect(TOKEN_MAINNET.ThornUSD, hre.ethers.provider);
    const USDT = ERC20__factory.connect(TOKEN_MAINNET.USDT, hre.ethers.provider);
    const poolDeployment = await get("pool_ThornUSD-USDT");
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
    console.log("usdt", await USDT.getAddress());
    console.log("thorn", await ThornUSD.getAddress());

    const factoryDeployment = await get("StableSwapFactory");
    const factory = StableSwapFactory__factory.connect(factoryDeployment.address, hre.ethers.provider);

    const poolx = await factory.getPairInfo(token0, token1);
    console.log("poolx", poolx);

    if (balance_lp < parseUnits("1", 18)) {
        let amountA = parseUnits("1", 6);
        let txRespone, txReceipt;
        console.log(" appove USDT");
        const balance = await USDT.balanceOf(deployer);
        console.log("balance USDT", formatUnits(balance, 6));
        txRespone = await USDT.connect(deployer2).approve(poolDeployment.address, amountA);
        txReceipt = await txRespone.wait();

        console.log(" appove ThornUSD");
        let amountB = parseUnits("1", 18);
        const balance2 = await ThornUSD.balanceOf(deployer);
        console.log("balance ThornUSD", formatUnits(balance2, 18));
        txRespone = await ThornUSD.connect(deployer2).approve(poolDeployment.address, amountB);
        txReceipt = await txRespone.wait();
        if ((await USDT.getAddress()) < (await ThornUSD.getAddress())) {
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
