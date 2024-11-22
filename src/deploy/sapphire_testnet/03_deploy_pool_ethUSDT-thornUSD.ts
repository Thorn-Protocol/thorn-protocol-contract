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
        const tethUSDT = "0x0011f28Df4943EDb1198B666ef600D8BD2f441fA";
        const thornUSD = "0x853db69df2875c9A10BBefe5ddF19a4Ad5F2D064";

        if ((await getOrNull("pool_tethUSDT-thornUSD")) == null) {
            const info_pool = await read("StableSwapFactory", "getPairInfo", tethUSDT, thornUSD);
            if (info_pool["swapContract"] == ZeroAddress) {
                console.log("Deploying pool tethUSDT-thornUSD");
                const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);
                const A = 1000;
                const Fee = 4000000;
                const AdminFee = 5000000000;
                const tx_non_signed = await factory.createSwapPair.populateTransaction(
                    tethUSDT,
                    thornUSD,
                    A,
                    Fee,
                    AdminFee
                );
                console.log("tx_non_signed", tx_non_signed);
            } else {
                console.log("Pool tethUSDT-thornUSD already deployed at: ", info_pool["swapContract"]);
                const singleton = await get("StableSwapTwoPool");
                await save("pool_tethUSDT-thornUSD", {
                    address: info_pool["swapContract"],
                    abi: singleton.abi,
                    userdoc: {},
                });
            }
        } else {
            console.log("Pool USDT-USDC already deployed at:", (await get("pool_tethUSDT-thornUSD")).address);
            const info_pool = await read("StableSwapFactory", "getPairInfo", tethUSDT, thornUSD);
            console.log("info_pool", info_pool);
            const lptoken = ERC20__factory.connect(info_pool["LPContract"], hre.ethers.provider);
            const decimals = await lptoken.decimals();
            console.log("LP decimals:", decimals.toString());
            const symbol = await lptoken.symbol();
            console.log("LP symbol:", symbol);
        }
    }
};
deploy.tags = ["tethUSDT-thornUSD"];
export default deploy;
