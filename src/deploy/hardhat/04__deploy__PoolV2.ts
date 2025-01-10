import { USDT } from "../../../typechain-types/contracts/mocks/USDT";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CHAIN_ID } from "../../utils/network";
import { ZeroAddress } from "ethers";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, get, execute, read, save } = deployments;
    const { deployer } = await getNamedAccounts();
    const A = 1000;
    const Fee = 4_000_000;
    const AdminFee = 5_000_000_000;
    await deploy("TKN6", {
        from: deployer,
        contract: "ERC2Mintable",
        args: ["TKN1", "TKN1"],
        log: false,
        autoMine: true,
    });
    await deploy("TKN7", {
        from: deployer,
        contract: "ERC2Mintable",
        args: ["TKN2", "TKN2"],
        log: false,
        autoMine: true,
    });
    const TKN6 = await get("TKN6");
    const TKN7 = await get("TKN7");
    const factory = await get("StableSwapFactory");
    const lpToken = await deploy("LPToken", {
        from: deployer,
        contract: "StableSwapLP",
        args: [],
        log: false,
        autoMine: true,
    });
    const poolv2 = await deploy("poolV2", {
        from: deployer,
        contract: "StableSwapTwoPoolV2",
        args: [],
        log: false,
        autoMine: true,
    });
    await execute(
        "poolV2",
        { from: deployer, log: true },
        "initialize",
        [TKN6.address, TKN7.address],
        A,
        Fee,
        AdminFee,
        deployer,
        lpToken.address
    );
    await execute("StableSwapFactory", { from: deployer, log: true }, "addPairInfo", poolv2.address);
};
deploy.tags = ["poolv2"];
export default deploy;
