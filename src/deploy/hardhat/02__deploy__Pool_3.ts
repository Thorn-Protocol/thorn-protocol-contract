import { USDT } from "../../../typechain-types/contracts/mocks/USDT";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ZeroAddress } from "ethers";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, execute, read, save } = deployments;
    const { deployer } = await getNamedAccounts();

    // const A = 1000;
    // const Fee = 4000000;
    // const AdminFee = 5000000000;

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        const A = 100;
        const Fee = 4_000_000;
        const AdminFee = 5_000_000_000;

        const TKN1 = await get("TKN1");
        const TKN2 = await get("TKN2");
        const TKN3 = await get("TKN3");

        const receipt = await execute(
            "StableSwapFactory",
            { from: deployer, log: true },
            "createThreePoolPair",
            TKN1.address,
            TKN2.address,
            TKN3.address,
            A,
            Fee,
            AdminFee
        );

        // const LPEvent = receipt.events?.find((log) => log.event === "NewStableSwapLP");
        const info = await read("StableSwapFactory", "getThreePoolPairInfo", TKN1.address, TKN2.address);
        console.log("LP Token:", info);

        await save("Pool3", {
            address: info["swapContract"],
            devdoc: {
                swapContract: info.swapContract,
                token1: info.token1,
                token2: info.token2,
                token3: info.token3,
                LP: info.lpToken,
                A: info.A,
                fee: info.fee,
                adminFee: info.adminFee,
            },
            abi: (await get("StableSwapThreePool")).abi,
        });
    }
};
deploy.tags = ["USDC"];
export default deploy;
