import { ethers } from "hardhat";
import hre from "hardhat";
import { ERC20__factory, StableSwapLP__factory, StableSwapTwoPool__factory } from "../../typechain-types";
import { TOKEN_ADDRESS } from "../utils/addresses";
import { formatUnits, parseUnits } from "ethers";

async function add_liquidity_tethUSDT_ThornUSD() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    const tbscUSDT = ERC20__factory.connect(TOKEN_ADDRESS.tbscUSDT, hre.ethers.provider);
    const ThornUSD = ERC20__factory.connect(TOKEN_ADDRESS.ThornUSD, hre.ethers.provider);
    const poolDeployment = await get("pool_tbscUSDT-thornUSD");
    const pool = StableSwapTwoPool__factory.connect(poolDeployment.address, hre.ethers.provider);
    const lpAddress = await pool.token();
    const lp = StableSwapLP__factory.connect(lpAddress, hre.ethers.provider);
    let balance_lp = await lp.balanceOf(deployer);
    console.log("balance_lp", formatUnits(balance_lp, 18));

    if (balance_lp < parseUnits("100", 18)) {
        const amount = parseUnits("10000", 6);
        let txRespone, txReceipt;
        console.log(" appove tbscUSDT");
        const balance = await tbscUSDT.balanceOf(deployer);
        console.log("balance tbscUSDT", formatUnits(balance, 6));
        txRespone = await tbscUSDT.connect(deployer2).approve(poolDeployment.address, amount);
        txReceipt = await txRespone.wait();

        console.log(" appove tbscUSDT");
        const balance2 = await ThornUSD.balanceOf(deployer);
        console.log("balance tbscUSDT", formatUnits(balance2, 6));
        txRespone = await ThornUSD.connect(deployer2).approve(poolDeployment.address, amount);
        txReceipt = await txRespone.wait();

        console.log(" add_liquidity");
        txRespone = await pool.connect(deployer2).add_liquidity([amount, amount], 0);
        txReceipt = await txRespone.wait();
        balance_lp = await lp.balanceOf(deployer);
        console.log("balance_lp", formatUnits(balance_lp, 18));
    }
}

add_liquidity_tethUSDT_ThornUSD();
