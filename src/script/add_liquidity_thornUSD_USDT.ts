import { ethers } from "hardhat";
import hre from "hardhat";
import { ERC20__factory, StableSwapLP__factory, StableSwapTwoPool__factory } from "../../typechain-types";
import { formatUnits, parseUnits } from "ethers";
import { TOKEN_TESTNET } from "../config";

async function add_liquidity_tethUSDT_ThornUSD() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    const ThornUSD = ERC20__factory.connect(TOKEN_TESTNET.ThornUSD, hre.ethers.provider);
    const USDT = ERC20__factory.connect(TOKEN_TESTNET.USDT, hre.ethers.provider);
    const poolDeployment = await get("pool_ThornUSD-USDT");
    const pool = StableSwapTwoPool__factory.connect(poolDeployment.address, hre.ethers.provider);
    const lpAddress = await pool.token();
    const lp = StableSwapLP__factory.connect(lpAddress, hre.ethers.provider);
    let balance_lp = await lp.balanceOf(deployer);
    console.log("balance_lp", formatUnits(balance_lp, 18));

    if (balance_lp < parseUnits("100", 18)) {
        const amountA = parseUnits("10000", 6);
        let txRespone, txReceipt;
        console.log(" appove USDT");
        const balance = await USDT.balanceOf(deployer);
        console.log("balance USDT", formatUnits(balance, 6));
        txRespone = await USDT.connect(deployer2).approve(poolDeployment.address, amountA);
        txReceipt = await txRespone.wait();

        console.log(" appove ThornUSD");
        const amountB = parseUnits("10000", 18);
        const balance2 = await ThornUSD.balanceOf(deployer);
        console.log("balance ThornUSD", formatUnits(balance2, 18));
        txRespone = await ThornUSD.connect(deployer2).approve(poolDeployment.address, amountB);
        txReceipt = await txRespone.wait();

        console.log(" add_liquidity");
        txRespone = await pool.connect(deployer2).add_liquidity([amountB, amountA], 0);
        txReceipt = await txRespone.wait();
        balance_lp = await lp.balanceOf(deployer);
        console.log("balance_lp", formatUnits(balance_lp, 18));
    }
}

add_liquidity_tethUSDT_ThornUSD();
