import { ethers } from "hardhat";
import hre from "hardhat";
import { ERC20__factory, StableSwapLP__factory, StableSwapTwoPool__factory } from "../../typechain-types";
import { TOKEN_TESTNET } from "../utils/addresses";
import { formatUnits, parseUnits } from "ethers";

async function mint() {
    const { deployments, getNamedAccounts, getChainId } = hre;
    const { deploy, read, get, execute } = deployments;
    const { deployer } = await getNamedAccounts();
    const deployer2 = await hre.ethers.provider.getSigner(0);

    const amount = parseUnits("100000000", 18);
    const address = "0x546f8A14e67541DF80c65b9BB4aAE5FF26eFEf24";
    await execute("TKN1", { from: deployer }, "mint", address, amount);
    await execute("TKN2", { from: deployer }, "mint", address, amount);
}

mint();
