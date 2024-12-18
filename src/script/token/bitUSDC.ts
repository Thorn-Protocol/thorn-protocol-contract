import hre from "hardhat";
import { formatEther, parseEther, ZeroAddress } from "ethers";
import { ERC20__factory, Test__factory } from "../../../typechain-types";
import { TOKEN_MAINNET } from "../../config";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
async function token() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);
    const token = ERC20__factory.connect(TOKEN_MAINNET.bitUSD, hre.ethers.provider);
    const name = await token.name();
    console.log("name", name);
    const symbol = await token.symbol();
    console.log("symbol", symbol);
    const decimals = await token.decimals();
    console.log("decimals", decimals.toString());
    const totalSupply = await token.totalSupply();
    console.log("totalSupply", formatEther(totalSupply));
    const balance2 = await token.balanceOf(ZeroAddress);
    console.log("balance", formatEther(balance2));
    const testDeployment = await get("Test");
    const test = Test__factory.connect(testDeployment.address, hre.ethers.provider);
    let balanceTest = await test.getBalance(TOKEN_MAINNET.bitUSD);
    console.log("balanceTest", formatEther(balanceTest));
}

token();
