import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        await deploy("TKN1", {
            from: deployer,
            args: [],
            log: true,
            autoMine: true,
        });
        await deploy("TKN2", {
            from: deployer,
            args: [],
            log: true,
            autoMine: true,
        });
        await deploy("TKN3", {
            from: deployer,
            args: [],
            log: true,
            autoMine: true,
        });
    }
};
deploy.tags = ["USDC"];
export default deploy;
