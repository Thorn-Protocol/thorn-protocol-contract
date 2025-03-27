import { ethers } from "hardhat";
import hre from "hardhat";
import { ERC20__factory, StableSwapLP__factory, StableSwapTwoPool__factory } from "../../typechain-types";
import { formatUnits, parseUnits } from "ethers";
import { TOKEN_MAINNET, TOKEN_TESTNET } from "../config";

async function add_liquidity_tethUSDT_ThornUSD() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    const bitUSDe = ERC20__factory.connect(TOKEN_MAINNET.bitUSD, hre.ethers.provider);
    const USDCe = ERC20__factory.connect(TOKEN_MAINNET.USDCe, hre.ethers.provider);

    const poolDeployment = await get("pool_bitUSD-USDCe");
    const pool = StableSwapTwoPool__factory.connect(poolDeployment.address, hre.ethers.provider);
    const lpAddress = await pool.token();
    const lp = StableSwapLP__factory.connect(lpAddress, hre.ethers.provider);
    let balance_lp = await lp.balanceOf(deployer);
    console.log("balance_lp", formatUnits(balance_lp, 18));

    if (balance_lp < parseUnits("1", 18)) {
        const amountA = parseUnits("1", 18);
        let txRespone, txReceipt;
        console.log(" appove bitUSDs");
        const balance = await bitUSDe.connect(deployer2).balanceOf(deployer);
        console.log("balance bitUSDs", formatUnits(balance, 18));
        txRespone = await bitUSDe.connect(deployer2).approve(poolDeployment.address, amountA);
        txReceipt = await txRespone.wait();

        const amountB = parseUnits("1", 6);
        console.log(" appove USDCe");
        const balance2 = await USDCe.balanceOf(deployer);
        console.log("balance USDCe", formatUnits(balance2, 6));
        txRespone = await USDCe.connect(deployer2).approve(poolDeployment.address, amountB);
        txReceipt = await txRespone.wait();

        console.log(" add_liquidity");
        txRespone = await pool.connect(deployer2).add_liquidity([amountB, amountA], 0);
        txReceipt = await txRespone.wait();
        balance_lp = await lp.balanceOf(deployer);
        console.log("balance_lp", formatUnits(balance_lp, 18));
    }
}

add_liquidity_tethUSDT_ThornUSD();
