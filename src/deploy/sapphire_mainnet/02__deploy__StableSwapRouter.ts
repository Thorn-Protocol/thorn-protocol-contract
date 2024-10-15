import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ADMIN_WALLET } from "../../config";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, getOrNull, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.OASIS_SAPPHIRE_MAINNET) {
        const helper = await get("SmartRouterHelper");
        const stable_swap_factory = await get("StableSwapFactory");
        const stable_swap_info = await get("StableSwapInfo");

        if ((await getOrNull("StableSwapRouter")) == null) {
            await deploy("StableSwapRouter", {
                from: deployer,
                args: [stable_swap_factory.address, stable_swap_info.address],
                log: true,
                autoMine: true,
                skipIfAlreadyDeployed: true,
                libraries: {
                    SmartRouterHelper: helper.address,
                },
            });

            await execute(
                "StableSwapRouter",
                { from: deployer, log: true },
                "transferOwnership",
                ADMIN_WALLET.SAPPHIRE_MAINNET
            );
        }
    }
};
deploy.tags = ["stable-swap-router"];
export default deploy;
