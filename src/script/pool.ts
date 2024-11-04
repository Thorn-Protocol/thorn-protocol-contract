import hre from "hardhat";
import { ERC20__factory, StableSwapFactory__factory, StableSwapTwoPool__factory } from "../../typechain-types";
import { TOKEN_MAINNET, TOKEN_TESTNET } from "../config";
import { plainPools } from "../../typechain-types/contracts/stableSwap";
import { formatEther, parseEther } from "ethers";

async function info(addressERC20: string, pool: string) {
    if (addressERC20 == TOKEN_TESTNET.ROSE) {
        const provider = hre.ethers.provider;

        console.log("symbol: ", "ROSE");

        const balance_pool = await provider.getBalance(pool);
        console.log("balance_pool", formatEther(balance_pool));
        return;
    }
    const token = ERC20__factory.connect(addressERC20, hre.ethers.provider);

    const symbol = await token.symbol();
    const balance_pool = await token.balanceOf(pool);

    console.log("symbol", symbol);
    console.log("balance_pool", formatEther(balance_pool));
}

async function pool() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    // const data = await read("pool_ROSE-stROSE", "support_ROSE");
    // console.log(" data ", data);
    // const stROSE = ERC20__factory.connect(TOKEN_MAINNET.stROSE, hre.ethers.provider);
    const poolAddress = (await get("pool_ROSE-stROSE")).address;
    const pool = StableSwapTwoPool__factory.connect(poolAddress, hre.ethers.provider);
    // const balance = await stROSE.balanceOf(deployer);
    let txRespone, txReceipt;
    const tokenLPAddress = await pool.token();
    console.log("tokenLPAddress", tokenLPAddress);
    const tokenLP = ERC20__factory.connect(tokenLPAddress, hre.ethers.provider);
    const totalSupply = await tokenLP.totalSupply();
    console.log("balanceLP", totalSupply.toString());

    const token1Address = await pool.coins(0);
    const token2Address = await pool.coins(1);

    console.log("token1Address", token1Address);
    console.log("token2Address", token2Address);
    await info(token1Address, poolAddress);
    await info(token2Address, poolAddress);

    const virutalPrice = await pool.get_virtual_price();

    console.log("virutalPrice", formatEther(virutalPrice.toString()));
}

pool();
