import { USDC } from "./../../../typechain-types/contracts/mocks/USDC";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ADMIN_WALLET, TOKEN_MAINNET, TOKEN_TESTNET } from "../../config";
import { ZeroAddress } from "ethers";
import { StableSwapFactory__factory } from "../../../typechain-types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { get, getOrNull, read, save, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const thornUSD = TOKEN_MAINNET.ThornUSD;

    const USDT = TOKEN_MAINNET.USDT;

    let info_pool = await read("StableSwapFactory", "getPairInfo", thornUSD, USDT);

    if (info_pool["swapContract"] == ZeroAddress) {
        const poolAddress = "0x97CfAB3b6B503aC5251FFb6d8182F4A3cbb27Ea9";
        console.log(" adding pair ");
        await execute(
            "StableSwapFactory",
            { from: deployer, log: true, gasLimit: 10000000 },
            "addPairInfo",
            poolAddress
        );

        const singleton = await get("StableSwapTwoPool");
        let info_pool = await read("StableSwapFactory", "getPairInfo", thornUSD, USDT);
        console.log("info_pool", info_pool);
        await save("pool_ThornUSD-USDT", {
            address: info_pool["swapContract"],
            abi: singleton.abi,
            userdoc: {},
        });
    }
};
deploy.tags = ["ThornUSD-USDT"];

export default deploy;
