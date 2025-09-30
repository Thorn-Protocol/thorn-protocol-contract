import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ADMIN_WALLET, TOKEN_MAINNET, TOKEN_TESTNET } from "../../config";
import { ZeroAddress } from "ethers";
import { StableSwapFactory__factory } from "../../../typechain-types";
import { addresses } from "../../utils/addresses";
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { get, getOrNull, read, save, execute } = deployments;
    const { deployer } = await getNamedAccounts();
    console.log("deployer", deployer);

    if ((await getChainId()) === CHAIN_ID.OASIS_SAPPHIRE_MAINNET) {
        const factoryDeploy = await get("StableSwapFactory");
        const stable_swap_factory = await get("StableSwapFactory");
        const stable_swap_info = await get("StableSwapInfo");

        if ((await getOrNull("pool_OCEAN-OCEAN")) == null) {
            const info_pool = await read("StableSwapFactory", "getPairInfo", addresses.OCEAN.Router, addresses.OCEAN.Celer);

            if (info_pool["swapContract"] == ZeroAddress) {
                console.log("Deploying pool OCEAN-OCEAN");
                const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);

                const A = 1000;
                const Fee = 4000000;
                const AdminFee = 5000000000;

                await execute("StableSwapFactory", { from: deployer, log: true, gasLimit: 10000000 }, "createSwapPair", addresses.OCEAN.Router, addresses.OCEAN.Celer, A, Fee, AdminFee);
            } else {
                console.log("Pool OCEAN-OCEAN already deployed at: ", info_pool["swapContract"]);
                const singleton = await get("StableSwapTwoPool");

                await save("pool_OCEAN-OCEAN", {
                    address: info_pool["swapContract"],
                    abi: singleton.abi,
                    userdoc: {},
                });
            }
        } else {
            console.log("Pool OCEAN-OCEAN already deployed at:", (await get("pool_OCEAN-OCEAN")).address);
            const info_pool = await read("StableSwapFactory", "getPairInfo", addresses.OCEAN.Router, addresses.OCEAN.Celer);
            console.log("info_pool", info_pool);
        }
    }
};
deploy.tags = ["OCEAN-OCEAN"];
export default deploy;
