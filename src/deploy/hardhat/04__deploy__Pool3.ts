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

        await deploy("TKN1", {
            from: deployer,
            contract: "ERC2Mintable",
            args: ["TKN1", "TKN1"],
            log: false,
            autoMine: true,
        });
        await deploy("TKN2", {
            from: deployer,
            contract: "ERC2Mintable",
            args: ["TKN2", "TKN2"],
            log: false,
            autoMine: true,
        });
        await deploy("TKN3", {
            from: deployer,
            contract: "ERC2Mintable",
            args: ["TKN3", "TKN3"],
            log: false,
            autoMine: true,
        });

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
        const info = await read("StableSwapFactory", "getThreePoolPairInfo", TKN1.address, TKN2.address);

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
deploy.tags = ["pool3"];
export default deploy;
