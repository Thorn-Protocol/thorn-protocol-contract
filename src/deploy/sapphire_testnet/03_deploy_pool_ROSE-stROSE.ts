import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ADMIN_WALLET, TOKEN_TESTNET } from "../../config";
import { ZeroAddress } from "ethers";
import { StableSwapFactory__factory } from "../../../typechain-types";
import { getSafe } from "../../safe/safe";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, getOrNull, execute, read } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.OASIS_SAPPHIRE_TESTNET) {
        const factoryDeploy = await get("StableSwapFactory");
        const stable_swap_factory = await get("StableSwapFactory");
        const stable_swap_info = await get("StableSwapInfo");

        if ((await getOrNull("pool_ROSE-stROSE")) == null) {
            console.log(" Deploying pool ROSE-stROSE");
            const info_pool = await read("StableSwapFactory", "getPairInfo", TOKEN_TESTNET.ROSE, TOKEN_TESTNET.stROSE);
            console.log("info_pool", info_pool);

            if (info_pool["swapContract"] == ZeroAddress) {
                console.log("Deploying pool ROSE-stROSE");
                const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);

                const A = 1000;
                const Fee = 4000000;
                const AdminFee = 5000000000;

                const tx_non_signed = await factory.createSwapPair.populateTransaction(
                    TOKEN_TESTNET.ROSE,
                    TOKEN_TESTNET.stROSE,
                    A,
                    Fee,
                    AdminFee
                );
                console.log("tx_non_signed", tx_non_signed);

                // const safe = await getSafe();

                // const tx = await safe.createTransaction({
                //     transactions: [
                //         {
                //             to: tx_non_signed.to,
                //             value: "0",
                //             data: tx_non_signed.data,
                //         },
                //     ],
                // });
                // console.log("tx", tx);
                // const tx = await safe.createTransaction({
                //     transactions: [
                //         {
                //             to: tx_non_signed.to,
                //             value: "0",
                //             data: tx_non_signed.data,
                //         },
                //     ],
                //     // options: {
                //     //     gasPrice: (100e9).toString(),
                //     //     gasToken: ZeroAddress,
                //     //     refundReceiver: ZeroAddress,
                //     // },
                // });

                //     const receipt = await safe.(tx);
                //  console.log("receipt", receipt);
            }
        }
    }
};
deploy.tags = ["ROSE-stROSE"];
export default deploy;
