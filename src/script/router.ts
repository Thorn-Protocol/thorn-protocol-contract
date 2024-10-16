import hre from "hardhat";
import { StableSwapFactory__factory } from "../../typechain-types";
import { TOKEN_MAINNET, TOKEN_TESTNET } from "../config";
import { parseEther } from "ethers";

async function router() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read } = deployments;
    const { deployer } = await getNamedAccounts();

    const factoryAddress = await read("StableSwapRouter", "stableSwapFactory");

    console.log(factoryAddress);

    const factory = StableSwapFactory__factory.connect(factoryAddress, hre.ethers.provider);

    const info = await factory.getPairInfo(TOKEN_MAINNET.stROSE, TOKEN_MAINNET.ROSE);

    console.log(info);

    const data = await read(
        "SmartRouterHelper",
        "getStableInfo",
        factoryAddress,
        TOKEN_MAINNET.ROSE,
        TOKEN_MAINNET.stROSE,
        2
    );

    console.log(" data ", data);

    const data2 = await read(
        "StableSwapRouter",
        "getOutputStableSwap",
        [TOKEN_MAINNET.stROSE, TOKEN_MAINNET.ROSE],
        [2n],
        parseEther("0.1"),
        0n
    );
    console.log(" data2 ", data2);
}

router();
