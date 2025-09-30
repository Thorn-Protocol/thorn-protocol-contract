import hre from "hardhat";
import { EIP173Proxy__factory, StableSwapFactory__factory, StableSwapTwoPool__factory } from "../../../typechain-types";
import { Wallet } from "ethers";

async function changeAdmin() {
  const { deployments, getNamedAccounts, getChainId } = hre;
  const { deploy, read, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const factory = StableSwapFactory__factory.connect((await get("StableSwapFactory")).address, hre.ethers.provider);

  const MULTISIG_ADDRESS = "0x22d84E0D742e23Fcb2c1a1C79BA89c97B10c123d";

  const adminFactory = await factory.admin();
  const wallet = new Wallet(process.env.PRIVATE_KEY_ADMIN_SAPPHIRE_MAINNET!, hre.ethers.provider);
  const factoryProxy = EIP173Proxy__factory.connect((await get("StableSwapFactory")).address, hre.ethers.provider);
  const adminFactoryProxy = await factoryProxy.owner();

  console.log("adminFactory: ", adminFactory);
  console.log("adminFactoryProxy: ", adminFactoryProxy);
  console.log("deployer", wallet.address);
  console.log("Multisig: ", MULTISIG_ADDRESS);

  if (adminFactoryProxy == wallet.address || adminFactoryProxy != MULTISIG_ADDRESS) {
    console.log("adminProxy is not the same as the multisig address");
    console.log("changeAdminProxy....");
    let tx = await factoryProxy.connect(wallet).transferOwnership(MULTISIG_ADDRESS);
    let response = await tx.wait();
    console.log("response", response?.hash);
  } else {
    console.log("adminProxy is the same as multisig address");
  }

  if (adminFactory == wallet.address || adminFactory != MULTISIG_ADDRESS) {
    console.log("admin factory is not the same as the multisig address");
    console.log("changeAdminProxy....");
    let tx = await factory.connect(wallet).transferAdminship(MULTISIG_ADDRESS);
    let response = await tx.wait();
    console.log("response", response?.hash);
  } else {
    console.log("adminProxy is the same as multisig address");
  }

  // ROSE - stROSE pool
  const pool1Deployment = await get("pool_ROSE-stROSE");
  const pool1 = StableSwapTwoPool__factory.connect(pool1Deployment.address, hre.ethers.provider);
  const adminROSEstROSEPool = await pool1.owner();
  console.log("admin ROSE-stROSE Pool: ", adminROSEstROSEPool);
  if (adminROSEstROSEPool == wallet.address || adminROSEstROSEPool != MULTISIG_ADDRESS) {
    console.log("admin ROSE-stROSE Pool is not the same as the multisig address");
    console.log("change Admin ROSEstROSE Pool....");
    let tx = await pool1.connect(wallet).transferOwnership(MULTISIG_ADDRESS);
    let response = await tx.wait();
    console.log("response", response?.hash);
  } else {
    console.log("admin ROSE-stROSE Pool is the same as multisig address");
  }

  // bitUSDs - USDCe
  const pool2Deployment = await get("pool_bitUSDs-USDCe");
  const pool2 = StableSwapTwoPool__factory.connect(pool2Deployment.address, hre.ethers.provider);
  const adminBitUSDsUSDCePool = await pool2.owner();
  console.log("admin bitUSDs-USDCe Pool: ", adminBitUSDsUSDCePool);
  if (adminBitUSDsUSDCePool == wallet.address || adminBitUSDsUSDCePool != MULTISIG_ADDRESS) {
    console.log("admin bitUSDs-USDCe Pool is not the same as the multisig address");
    console.log("change Admin bitUSDsUSDCe Pool....");
    let tx = await pool2.connect(wallet).transferOwnership(MULTISIG_ADDRESS);
    let response = await tx.wait();
    console.log("response", response?.hash);
  } else {
    console.log("admin bitUSDs-USDCe Pool is the same as multisig address");
  }

  // bitUSDs - USDT
  const pool3Deployment = await get("pool_bitUSDs-USDT");
  const pool3 = StableSwapTwoPool__factory.connect(pool3Deployment.address, hre.ethers.provider);
  const adminBitUSDsUSDTPool = await pool3.owner();
  console.log("admin bitUSDs-USDT Pool: ", adminBitUSDsUSDTPool);
  if (adminBitUSDsUSDTPool == wallet.address || adminBitUSDsUSDTPool != MULTISIG_ADDRESS) {
    console.log("admin bitUSDs-USDT Pool is not the same as the multisig address");
    console.log("change Admin bitUSDsUSDT Pool....");
    let tx = await pool3.connect(wallet).transferOwnership(MULTISIG_ADDRESS);
    let response = await tx.wait();
    console.log("response", response?.hash);
  } else {
    console.log("admin bitUSDs-USDT Pool is the same as multisig address");
  }

  // OCEAN-OCEAN
  const pool4Deployment = await get("pool_OCEAN-OCEAN");
  const pool4 = StableSwapTwoPool__factory.connect(pool4Deployment.address, hre.ethers.provider);
  const adminOCEANOCEANPool = await pool4.owner();
  console.log("admin OCEAN-OCEAN Pool: ", adminOCEANOCEANPool);
  if (adminOCEANOCEANPool == wallet.address || adminOCEANOCEANPool != MULTISIG_ADDRESS) {
    console.log("admin OCEAN-OCEAN Pool is not the same as the multisig address");
    console.log("change Admin OCEANOCEAN Pool....");
    let tx = await pool4.connect(wallet).transferOwnership(MULTISIG_ADDRESS);
    let response = await tx.wait();
    console.log("response", response?.hash);
  } else {
    console.log("admin OCEAN-OCEAN Pool is the same as multisig address");
  }
}

changeAdmin();
