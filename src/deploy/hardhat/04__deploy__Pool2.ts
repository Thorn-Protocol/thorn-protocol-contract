import { USDT } from "../../../typechain-types/contracts/mocks/USDT";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ZeroAddress } from "ethers";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, execute, read, save } = deployments;
    const { deployer } = await getNamedAccounts();

    if ((await getChainId()) === CHAIN_ID.HARDHAT) {
        const A = 1000;
        const Fee = 4_000_000;
        const AdminFee = 5_000_000_000;

        await deploy("TKN4", {
            from: deployer,
            contract: "ERC2Mintable",
            args: ["TKN4", "TKN4"],
            log: false,
            autoMine: true,
        });
        await deploy("TKN5", {
            from: deployer,
            contract: "ERC2Mintable",
            args: ["TKN4", "TKN4"],
            log: false,
            autoMine: true,
        });

        const TKN4 = await get("TKN4");
        const TKN5 = await get("TKN5");

        const receipt = await execute(
            "StableSwapFactory",
            { from: deployer, log: true },
            "createSwapPair",
            TKN4.address,
            TKN5.address,
            A,
            Fee,
            AdminFee
        );

        const info = await read("StableSwapFactory", "getPairInfo", TKN4.address, TKN5.address);
        await save("Pool2", {
            address: info["swapContract"],
            devdoc: {
                swapContract: info.swapContract,
                token1: info.token0,
                token2: info.token1,
                LP: info.LPContract,
                A: A,
                fee: Fee,
                adminFee: AdminFee,
            },
            abi: (await get("StableSwapTwoPool")).abi,
        });
    }
};
deploy.tags = ["pool2"];
export default deploy;
