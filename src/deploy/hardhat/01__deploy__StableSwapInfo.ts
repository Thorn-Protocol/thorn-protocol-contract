import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        const two_pool = await get("StableSwapTwoPoolInfo");
        const three_pool = await get("StableSwapThreePoolInfo");
        await deploy("StableSwapInfo", {
            from: deployer,
            args: [two_pool.address, three_pool.address],
            log: true,
            autoMine: true,
        });
    }
};
deploy.tags = ["two-pool-deployer"];
export default deploy;
