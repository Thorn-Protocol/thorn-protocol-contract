import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.OASIS_SAPPHIRE_MAINNET) {
        await deploy("StableSwapTwoPoolInfo", {
            from: deployer,
            args: [],
            log: true,
            skipIfAlreadyDeployed: true,
            autoMine: true,
        });
    }
};
deploy.tags = ["two-pool-info"];
export default deploy;
