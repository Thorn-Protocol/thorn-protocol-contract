import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { get, getOrNull, read, save, execute, deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy("Test", {
        from: deployer,
        args: [],
        log: true,
        proxy: {
            owner: deployer,
        },
    });
};
deploy.tags = ["Test"];
export default deploy;
