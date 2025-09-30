import { ethers } from "hardhat";
import hre from "hardhat";
import { ERC20__factory, StableSwapLP__factory, StableSwapTwoPool__factory } from "../../../typechain-types";
import { formatUnits, parseUnits } from "ethers";
import { TOKEN_MAINNET, TOKEN_TESTNET } from "../../config";

async function main() {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, read, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const poolDeployment = await get("pool_bitUSDs-USDCe");
  const pool = StableSwapTwoPool__factory.connect(poolDeployment.address, hre.ethers.provider);
  const lpAddress = await pool.token();
  console.log("lpAddress of pool_bitUSDs-USDCe: ", lpAddress);

  const poolDeployment2 = await get("pool_ROSE-stROSE");
  const pool2 = StableSwapTwoPool__factory.connect(poolDeployment2.address, hre.ethers.provider);
  const lpAddress2 = await pool2.token();
  console.log("lpAddress of pool_ROSE-stROSE: ", lpAddress2);
}

main();
