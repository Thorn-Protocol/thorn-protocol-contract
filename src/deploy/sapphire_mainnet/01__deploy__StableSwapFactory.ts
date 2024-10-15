import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ADMIN_WALLET } from "../../config";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, read, execute, getOrNull } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.OASIS_SAPPHIRE_MAINNET) {
        const lp_factory = await get("StableSwapLPFactory");
        const two_pool_deployer = await get("StableSwapTwoPoolDeployer");
        const three_pool_deployer = await get("StableSwapThreePoolDeployer");
        if ((await getOrNull("StableSwapFactory")) == null) {
            const receipt = await deploy("StableSwapFactory", {
                from: deployer,
                args: [],
                log: true,
                autoMine: true,
                proxy: {
                    owner: deployer,
                    execute: {
                        init: {
                            methodName: "initialize",
                            args: [
                                lp_factory.address,
                                two_pool_deployer.address,
                                three_pool_deployer.address,
                                deployer,
                            ],
                        },
                    },
                },
            });

            await execute(
                "StableSwapTwoPoolDeployer",
                { from: deployer, log: true },
                "transferOwnership",
                receipt.address
            );
            await execute(
                "StableSwapThreePoolDeployer",
                { from: deployer, log: true },
                "transferOwnership",
                receipt.address
            );
            await execute("StableSwapLPFactory", { from: deployer, log: true }, "transferOwnership", receipt.address);
            const admin = await read("StableSwapFactory", "admin");
            console.log("Admin:", admin);

            await execute(
                "StableSwapFactory",
                { from: deployer, log: true },
                "transferOwnership",
                ADMIN_WALLET.SAPPHIRE_TESTNET
            );
            await execute(
                "StableSwapFactory",
                { from: deployer, log: true },
                "transferAdminship",
                ADMIN_WALLET.SAPPHIRE_TESTNET
            );
        } else {
        }
    }
};
deploy.tags = ["factory"];
export default deploy;
