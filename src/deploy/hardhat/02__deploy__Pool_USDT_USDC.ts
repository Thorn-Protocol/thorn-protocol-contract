import { USDT } from "./../../../typechain-types/contracts/mocks/USDT";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ZeroAddress } from "ethers";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, execute, read, save } = deployments;
    const { deployer } = await getNamedAccounts();

    const A = 1000;
    const Fee = 4000000;
    const AdminFee = 5000000000;

    const USDT = await get("USDT");
    const USDC = await get("USDC");

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        const receipt = await execute(
            "StableSwapFactory",
            { from: deployer, log: true },
            "createSwapPair",
            USDT.address,
            USDC.address,
            A,
            Fee,
            AdminFee
        );

        // const LPEvent = receipt.events?.find((log) => log.event === "NewStableSwapLP");
        const info = await read("StableSwapFactory", "stableSwapPairInfo", USDC.address, USDT.address, ZeroAddress);
        console.log("LP Token:", info);

        await save("Pool_USDT_USDC", {
            address: info["swapContract"],
            devdoc: {
                swapContract: info.swapContract,
                token1: info.token1,
                token2: info.token2,
                LP: info.lpToken,
                A: info.A,
                fee: info.fee,
                adminFee: info.adminFee,
            },
            abi: (await get("StableSwapTwoPool")).abi,
        });
    }
};
deploy.tags = ["USDC"];
export default deploy;
