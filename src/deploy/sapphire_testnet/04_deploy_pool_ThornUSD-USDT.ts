import { TOKEN_TESTNET } from "./../../config";
import { USDC } from "./../../../typechain-types/contracts/mocks/USDC";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ADMIN_WALLET, TOKEN_MAINNET } from "../../config";
import { ZeroAddress } from "ethers";
import { StableSwapFactory__factory } from "../../../typechain-types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { get, getOrNull, read, save, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    const thornUSD = TOKEN_TESTNET.thornUSD;

    const USDT = TOKEN_TESTNET.USDT;
    const factoryDeploy = await get("StableSwapFactory");
    const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);
    let info_pool = await read("StableSwapFactory", "getPairInfo", thornUSD, USDT);

    if (info_pool["swapContract"] == ZeroAddress) {
        const poolAddress = "0x6E6D78390Cb1d65B1c659AE7775e135635bb0c27";
        console.log(" adding pair ");
        let txPopulate = await factory.addPairInfo.populateTransaction(poolAddress);
        console.log("txPopulate", txPopulate);

        // const singleton = await get("StableSwapTwoPool");
        // let info_pool = await read("StableSwapFactory", "getPairInfo", thornUSD, USDT);
        // console.log("info_pool", info_pool);
        // await save("pool_ThornUSD-USDT", {
        //     address: info_pool["swapContract"],
        //     abi: singleton.abi,
        //     userdoc: {},
        // });
    }
};
deploy.tags = ["ThornUSD-USDT"];

export default deploy;
