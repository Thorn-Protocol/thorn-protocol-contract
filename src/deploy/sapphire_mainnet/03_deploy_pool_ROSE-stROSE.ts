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

    if ((await getChainId()) === CHAIN_ID.OASIS_SAPPHIRE_MAINNET) {
        const factoryDeploy = await get("StableSwapFactory");
        const stable_swap_factory = await get("StableSwapFactory");
        const stable_swap_info = await get("StableSwapInfo");

        if ((await getOrNull("pool_ROSE-stROSE")) == null) {
            const info_pool = await read("StableSwapFactory", "getPairInfo", TOKEN_MAINNET.ROSE, TOKEN_MAINNET.stROSE);

            if (info_pool["swapContract"] == ZeroAddress) {
                console.log("Deploying pool ROSE-stROSE");
                const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);

                const A = 1000;
                const Fee = 4000000;
                const AdminFee = 5000000000;

                // const tx_non_signed = await factory.createSwapPair.populateTransaction(
                //     TOKEN_MAINNET.ROSE,
                //     TOKEN_MAINNET.stROSE,
                //     A,
                //     Fee,
                //     AdminFee
                // );
                // console.log("tx_non_signed", tx_non_signed);

                await execute(
                    "StableSwapFactory",
                    { from: deployer, log: true, gasLimit: 10000000 },
                    "createSwapPair",
                    TOKEN_MAINNET.ROSE,
                    TOKEN_MAINNET.stROSE,
                    A,
                    Fee,
                    AdminFee
                );
            } else {
                console.log("Pool ROSE-stROSE already deployed at: ", info_pool["swapContract"]);
                const singleton = await get("StableSwapTwoPool");

                await save("pool_ROSE-stROSE", {
                    address: info_pool["swapContract"],
                    abi: singleton.abi,
                    userdoc: {},
                });
            }
        } else {
            console.log("Pool ROSE-stROSE already deployed at:", (await get("pool_ROSE-stROSE")).address);
            const info_pool = await read("StableSwapFactory", "getPairInfo", TOKEN_MAINNET.ROSE, TOKEN_MAINNET.stROSE);
            console.log("info_pool", info_pool);
        }
    }
};
deploy.tags = ["ROSE-stROSE"];
export default deploy;
