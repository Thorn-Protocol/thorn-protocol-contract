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

    const USDC = TOKEN_MAINNET.USDCe;

    let info_pool = await read("StableSwapFactory", "getPairInfo", thornUSD, USDC);

    if (info_pool["swapContract"] == ZeroAddress) {
        const poolAddress = "0x425C9532f058DceC22F00631eaCfA363414A3c95";
        console.log(" adding pair ");
        await execute(
            "StableSwapFactory",
            { from: deployer, log: true, gasLimit: 10000000 },
            "addPairInfo",
            poolAddress
        );

        const singleton = await get("StableSwapTwoPool");
        let info_pool = await read("StableSwapFactory", "getPairInfo", thornUSD, USDC);
        await save("pool_ThornUSD-USDC", {
            address: info_pool["swapContract"],
            abi: singleton.abi,
            userdoc: {},
        });
    }
};
deploy.tags = ["ThornUSD-USDC"];

export default deploy;
