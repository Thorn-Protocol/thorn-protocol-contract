import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const lp_factory = await get("StableSwapLPFactory");
    const two_pool_deployer = await get("StableSwapTwoPoolDeployer");
    const three_pool_deployer = await get("StableSwapThreePoolDeployer");

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        await deploy("StableSwapFactory", {
            from: deployer,
            args: [],
            log: true,
            autoMine: true,
            proxy: {
                owner: deployer,
                execute: {
                    init: {
                        methodName: "initialize",
                        args: [lp_factory.address, two_pool_deployer.address, three_pool_deployer.address, deployer],
                    },
                },
            },
        });
    }
};
deploy.tags = ["two-pool-deployer"];
export default deploy;
