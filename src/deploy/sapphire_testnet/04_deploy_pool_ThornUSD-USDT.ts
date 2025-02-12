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

    const factoryDeploy = await get("StableSwapFactory");
    const stable_swap_factory = await get("StableSwapFactory");
    const stable_swap_info = await get("StableSwapInfo");

    const tokenA = TOKEN_TESTNET.ThornUSD;
    const tokenB = TOKEN_TESTNET.USDT;

    const namePool = "pool_ThornUSD-USDT";

    if ((await getOrNull(namePool)) == null) {
        const info_pool = await read("StableSwapFactory", "getPairInfo", tokenA, tokenB);
        if (info_pool["swapContract"] == ZeroAddress) {
            console.log(`Deploying pool ${namePool}`);
            const factory = StableSwapFactory__factory.connect(factoryDeploy.address, hre.ethers.provider);

            const A = 1000;
            const Fee = 4000000;
            const AdminFee = 5000000000;

            const tx_non_signed = await factory.createSwapPair.populateTransaction(tokenA, tokenB, A, Fee, AdminFee);
            console.log("tx_non_signed", tx_non_signed);
        } else {
            console.log(`Pool ${namePool} already deployed at: `, info_pool["swapContract"]);
            const singleton = await get("StableSwapTwoPool");
            await save(namePool, {
                address: info_pool["swapContract"],
                abi: singleton.abi,
                userdoc: {},
            });
            // const info_pool = await read("StableSwapFactory", "getPairInfo", tokenA, tokenB);
            console.log("info_pool", info_pool);
            const lptoken = ERC20__factory.connect(info_pool["LPContract"], hre.ethers.provider);
            const decimals = await lptoken.decimals();
            console.log("LP decimals:", decimals.toString());
            const symbol = await lptoken.symbol();
            console.log("LP symbol:", symbol);
        }
    } else {
        console.log(`Pool ${namePool} already deployed at:`, (await get(namePool)).address);
        const info_pool = await read("StableSwapFactory", "getPairInfo", tokenA, tokenB);
        console.log("info_pool", info_pool);
        const lptoken = ERC20__factory.connect(info_pool["LPContract"], hre.ethers.provider);
        const decimals = await lptoken.decimals();
        console.log("LP decimals:", decimals.toString());
        const symbol = await lptoken.symbol();
        console.log("LP symbol:", symbol);
    }
};
deploy.tags = ["pool_ThornUSD-USDT"];
export default deploy;
