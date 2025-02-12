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

    const info_pool = await read("StableSwapFactory", "getPairInfo", thornUSD, USDT);

    if (info_pool["swapContract"] == ZeroAddress) {
        const poolAddress = "0xf2f6270c24ca55251E68897DE4Fadf48C9221795";

        await execute(
            "StableSwapFactory",
            { from: deployer, log: true, gasLimit: 10000000 },
            "addPairInfo",
            poolAddress
        );

        const singleton = await get("StableSwapTwoPool");

        await save("pool_ThornUSD-USDT", {
            address: info_pool["swapContract"],
            abi: singleton.abi,
            userdoc: {},
        });
    }
};
deploy.tags = ["ThornUSD-USDT"];

export default deploy;
