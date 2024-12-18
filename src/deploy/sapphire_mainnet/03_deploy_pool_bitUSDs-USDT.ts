import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { TOKEN_MAINNET } from "../../config";
import { ZeroAddress } from "ethers";
import { StableSwapFactory__factory } from "../../../typechain-types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { get, getOrNull, read, save, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) !== CHAIN_ID.OASIS_SAPPHIRE_MAINNET) return;

    const tokenA = TOKEN_MAINNET.bitUSD;

    const tokenB = TOKEN_MAINNET.USDT;
    const namePool = "pool_bitUSDs-USDT";
    const factoryDeploy = await get("StableSwapFactory");

    if ((await getOrNull(namePool)) == null) {
        const info_pool = await read("StableSwapFactory", "getPairInfo", tokenA, tokenB);
        if (info_pool["swapContract"] == ZeroAddress) {
            console.log(`Deploying pool ${namePool}...`);
            const A = 1000;
            const Fee = 4000000;
            const AdminFee = 5000000000;
            await execute(
                "StableSwapFactory",
                { from: deployer, log: true, gasLimit: 10000000 },
                "createSwapPair",
                tokenA,
                tokenB,
                A,
                Fee,
                AdminFee
            );

            const info_pool = await read("StableSwapFactory", "getPairInfo", tokenA, tokenB);
            console.log(`Pool ${namePool} deployed at: `, info_pool["swapContract"]);
            const singleton = await get("StableSwapTwoPool");
            await save(namePool, {
                address: info_pool["swapContract"],
                abi: singleton.abi,
                userdoc: {},
            });
        } else {
            console.log(`Pool ${namePool} already deployed at: `, info_pool["swapContract"]);
            const singleton = await get("StableSwapTwoPool");
            await save(namePool, {
                address: info_pool["swapContract"],
                abi: singleton.abi,
                userdoc: {},
            });
        }
    } else {
        console.log(`Pool ${namePool} already deployed at:`, (await get(namePool)).address);
        const info_pool = await read("StableSwapFactory", "getPairInfo", tokenA, tokenB);
        console.log("info_pool", info_pool);
    }
};
deploy.tags = ["bitUSDs-USDT"];
export default deploy;
