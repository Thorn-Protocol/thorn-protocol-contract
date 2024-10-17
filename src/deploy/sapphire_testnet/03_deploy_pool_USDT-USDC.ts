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

        const usdt = "0x9DA08dDBCB74e9BDf309C7fa94F3b7AFB3341EB2";

        const usdc = "0x1DD8219c8A8f2fF453fd19F775e3dA8c0501E768";

        const usdtContract = ERC20__factory.connect(usdt, hre.ethers.provider);
        const decimals_usdt = await usdtContract.decimals();
        console.log("USDT decimals:", decimals_usdt.toString());

        return;
        if ((await getOrNull("pool_USDT-USDC")) == null) {
            // console.log(" Deploying pool ROSE-stROSE");
            const info_pool = await read("StableSwapFactory", "getPairInfo", usdc, usdt);
            if (info_pool["swapContract"] == ZeroAddress) {
                console.log("Deploying pool ROSE-stROSE");
                const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);

                const A = 1000;
                const Fee = 4000000;
                const AdminFee = 5000000000;

                const tx_non_signed = await factory.createSwapPair.populateTransaction(usdc, usdt, A, Fee, AdminFee);
                console.log("tx_non_signed", tx_non_signed);
            } else {
                console.log("Pool USDT-USDC already deployed at: ", info_pool["swapContract"]);
                const singleton = await get("StableSwapTwoPool");
                await save("pool_USDT-USDC", {
                    address: info_pool["swapContract"],
                    abi: singleton.abi,
                    userdoc: {},
                });
            }
        } else {
            console.log("Pool USDT-USDC already deployed at:", (await get("pool_ROSE-stROSE")).address);
            const info_pool = await read("StableSwapFactory", "getPairInfo", usdc, usdt);
            console.log("info_pool", info_pool);
            const lptoken = ERC20__factory.connect(info_pool["LPContract"], hre.ethers.provider);
            const decimals = await lptoken.decimals();
            console.log("LP decimals:", decimals.toString());
            const symbol = await lptoken.symbol();
            console.log("LP symbol:", symbol);
        }
    }
};
deploy.tags = ["USDT-USDC"];
export default deploy;
