import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const helper = await get("SmartRouterHelper");

    const stable_swap_factory = await get("StableSwapFactory");

    const stable_swap_info = await get("StableSwapInfo");

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        await deploy("StableSwapRouter", {
            from: deployer,
            args: [stable_swap_factory.address, stable_swap_info.address],
            log: true,
            autoMine: true,
            libraries: {
                SmartRouterHelper: helper.address,
            },
        });
    }
};
deploy.tags = ["two-pool-deployer"];
export default deploy;
