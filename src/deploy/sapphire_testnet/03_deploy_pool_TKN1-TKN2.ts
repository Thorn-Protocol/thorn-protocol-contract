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

    if ((await getChainId()) === CHAIN_ID.OASIS_SAPPHIRE_TESTNET) {
        const factoryDeploy = await get("StableSwapFactory");
        const stable_swap_factory = await get("StableSwapFactory");
        const stable_swap_info = await get("StableSwapInfo");

        const tkn1Deployment = await deploy("TKN1", {
            from: deployer,
            contract: "TKN1",
            args: [],
            log: true,
            skipIfAlreadyDeployed: true,
        });

        const tkn2Deployment = await deploy("TKN2", {
            from: deployer,
            contract: "TKN2",
            args: [],
            log: true,
            skipIfAlreadyDeployed: true,
        });

        if ((await getOrNull("pool_TKN1-TKN2")) == null) {
            const info_pool = await read(
                "StableSwapFactory",
                "getPairInfo",
                tkn1Deployment.address,
                tkn2Deployment.address
            );

            if (info_pool["swapContract"] == ZeroAddress) {
                console.log("Deploying pool TKN1-TKN2");
                const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);
                const A = 1000;
                const Fee = 4000000;
                const AdminFee = 5000000000;
                const tx_non_signed = await factory.createSwapPair.populateTransaction(
                    tkn1Deployment.address,
                    tkn2Deployment.address,
                    A,
                    Fee,
                    AdminFee
                );
                console.log("tx_non_signed", tx_non_signed);
            } else {
                console.log("Pool TKN1-TKN2 already deployed at: ", info_pool["swapContract"]);
                const singleton = await get("StableSwapTwoPool");
                await save("pool_TKN1-TKN2", {
                    address: info_pool["swapContract"],
                    abi: singleton.abi,
                    userdoc: {},
                });
            }
        } else {
            console.log("Pool TKN1-TKN2 already deployed at:", (await get("pool_TKN1-TKN2")).address);
            const info_pool = await read(
                "StableSwapFactory",
                "getPairInfo",
                tkn1Deployment.address,
                tkn2Deployment.address
            );
            console.log("info_pool", info_pool);
            const lptoken = ERC20__factory.connect(info_pool["LPContract"], hre.ethers.provider);
            const decimals = await lptoken.decimals();
            console.log("LP decimals:", decimals.toString());
            const symbol = await lptoken.symbol();
            console.log("LP symbol:", symbol);
        }
    }
};
deploy.tags = ["TKN1-TKN2"];
export default deploy;
