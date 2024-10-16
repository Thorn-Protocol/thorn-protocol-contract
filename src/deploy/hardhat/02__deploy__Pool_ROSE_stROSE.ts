import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ADMIN_WALLET, TOKEN_TESTNET } from "../../config";
import { ZeroAddress } from "ethers";
import { ERC20__factory, StableSwapFactory__factory } from "../../../typechain-types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, getOrNull, execute, read, save } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        const factoryDeploy = await get("StableSwapFactory");
        const stable_swap_factory = await get("StableSwapFactory");
        const stable_swap_info = await get("StableSwapInfo");

        if ((await getOrNull("pool_ROSE-stROSE")) == null) {
            const stROSE = await deploy("stROSE", {
                from: deployer,
                args: [],
                log: true,
                autoMine: true,
            });

            const info_pool = await read("StableSwapFactory", "getPairInfo", TOKEN_TESTNET.ROSE, stROSE.address);
            if (info_pool["swapContract"] == ZeroAddress) {
                //    console.log("Deploying pool ROSE-stROSE");
                const A = 1000;
                const Fee = 4000000;
                const AdminFee = 5000000000;
                await execute(
                    "StableSwapFactory",
                    { from: deployer, log: true, gasLimit: 10000000 },
                    "createSwapPair",
                    TOKEN_TESTNET.ROSE,
                    stROSE.address,
                    A,
                    Fee,
                    AdminFee
                );
                const info_pool = await read("StableSwapFactory", "getPairInfo", TOKEN_TESTNET.ROSE, stROSE.address);
                //  console.log("info_pool", info_pool);
                const singleton = await get("StableSwapTwoPool");
                await save("pool_ROSE-stROSE", {
                    address: info_pool["swapContract"],
                    abi: singleton.abi,
                    userdoc: {},
                });
            }
        } else {
        }
    }
};
deploy.tags = ["ROSE-stROSE"];
export default deploy;
