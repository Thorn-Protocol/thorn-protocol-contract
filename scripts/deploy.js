const { ethers } = require("hardhat");
const { writeToEnvFile } = require("./utils/helper");

async function main() {

    // const mockTokenFactory = await ethers.getContractFactory("StableSwapLP");
    // const mockTokenContract = await mockTokenFactory.deploy();
    // console.log(`Contract deployed to address: ${mockTokenContract.address}`);
    // writeToEnvFile("POOL_TOKEN", mockTokenContract.address);

    // const stableSwapInfoFactory = await ethers.getContractFactory("StableSwapInfo");
    // const stableSwapInfoContract = await stableSwapInfoFactory.deploy(
    //   process.env.STABLE_SWAP_TWO_POOL_INFO,
    //   process.env.STABLE_SWAP_THREE_POOL_INFO
    // );
    // console.log(`Contract deployed to address: ${stableSwapInfoContract.target}`);
    // writeToEnvFile("STABLE_SWAP_INFO", stableSwapInfoContract.target);

    // const stableSwapThreePoolInfoFactory = await ethers.getContractFactory("StableSwapThreePoolInfo");
    // const stableSwapThreePoolInfoContract = await stableSwapThreePoolInfoFactory.deploy();
    // console.log(`Contract deployed to address: ${stableSwapThreePoolInfoContract.target}`);
    // writeToEnvFile("STABLE_SWAP_THREE_POOL_INFO", stableSwapThreePoolInfoContract.target);

    // const stableSwapTwoPoolInfoFactory = await ethers.getContractFactory("StableSwapTwoPoolInfo");
    // const stableSwapTwoPoolInfoContract = await stableSwapTwoPoolInfoFactory.deploy();
    // console.log(`Contract deployed to address: ${stableSwapTwoPoolInfoContract.target}`);
    // writeToEnvFile("STABLE_SWAP_TWO_POOL_INFO", stableSwapTwoPoolInfoContract.target);

    // const stableSwapWROSEHelperFactory = await ethers.getContractFactory("StableSwapWROSEHelper");
    // const stableSwapWROSEHelperContract = await stableSwapWROSEHelperFactory.deploy();
    // console.log(`Contract deployed to address: ${stableSwapWROSEHelperContract.target}`);
    // writeToEnvFile("STABLE_SWAP_WWROSE_HELPER", stableSwapWROSEHelperContract.target);

    // const stableSwapFactory = await ethers.getContractFactory("StableSwapFactory");
    // const stableSwapFactoryContract = await stableSwapFactory.deploy(
    //   process.env.STABLE_SWAP_LP_FACTORY,
    //   process.env.STABLE_SWAP_TWO_POOL_DEPLOYER,
    //   process.env.STABLE_SWAP_THREE_POOL_DEPLOYER,
    // );
    // console.log(`Contract deployed to address: ${stableSwapFactoryContract.target}`);
    // writeToEnvFile("STABLE_SWAP_FACTORY", stableSwapFactoryContract.target);

    // const stableSwapLPFactory = await ethers.getContractFactory("StableSwapLP");
    // const stableSwapLPContract = await stableSwapLPFactory.deploy();
    // console.log(`Contract deployed to address: ${stableSwapLPContract.target}`);
    // writeToEnvFile("STABLE_SWAP_LP", stableSwapLPContract.target);

    // const stableSwapLPFactoryFactory = await ethers.getContractFactory("StableSwapLPFactory");
    // const stableSwapLPFactoryContract = await stableSwapLPFactoryFactory.deploy();
    // console.log(`Contract deployed to address: ${stableSwapLPFactoryContract.target}`);
    // writeToEnvFile("STABLE_SWAP_LP_FACTORY", stableSwapLPFactoryContract.target);

    // const stableSwapThreePoolDeployerFactory = await ethers.getContractFactory("StableSwapThreePoolDeployer");
    // const stableSwapThreePoolDeployerContract = await stableSwapThreePoolDeployerFactory.deploy();
    // console.log(`Contract deployed to address: ${stableSwapThreePoolDeployerContract.target}`);
    // writeToEnvFile("STABLE_SWAP_THREE_POOL_DEPLOYER", stableSwapThreePoolDeployerContract.target);

    // const stableSwapTwoPoolDeployerFactory = await ethers.getContractFactory("StableSwapTwoPoolDeployer");
    // const stableSwapTwoPoolDeployerContract = await stableSwapTwoPoolDeployerFactory.deploy();
    // console.log(`Contract deployed to address: ${stableSwapTwoPoolDeployerContract.target}`);
    // writeToEnvFile("STABLE_SWAP_TWO_POOL_DEPLOYER", stableSwapTwoPoolDeployerContract.target);


    // const SmartRouterHelperFactory=await ethers.getContractFactory("SmartRouterHelper");
    // const SmartRouterHelperContract=await SmartRouterHelperFactory.deploy();
    // console.log(`Contract deployed to address: ${SmartRouterHelperContract.address}`);
    // writeToEnvFile("SMART_ROUTER_HELPER_LIBRARY",SmartRouterHelperContract.address);

    // const StableSwapRouterFactory = await ethers.getContractFactory("StableSwapRouter",{
    //   libraries:{
    //       SmartRouterHelper: process.env.SMART_ROUTER_HELPER_LIBRARY,
    //   }
    // });
    // const StableSwapRouterContract =await StableSwapRouterFactory.deploy(process.env.STABLE_SWAP_FACTORY,process.env.STABLE_SWAP_INFO);
    // console.log(`Contract deployed to address: ${StableSwapRouterContract.address}`);
    // writeToEnvFile("STABLE_SWAP_ROUTER", StableSwapRouterContract.address);

    // const SwapMetaFactory = await ethers.getContractFactory("SwapMeta");
    // const SwapMetaContract = await SwapMetaFactory.deploy(
    //   process.env.PUBLIC_KEY,
    //   [process.env.STB_TOKEN, process.env.LP_TOKEN],
    //   process.env.POOL_TOKEN,
    //   process.env.BASE_POOL,
    //   1000,
    //   4000000,
    //   5000000000,
    //   // {gasLimit:1e7, gasPrice:100e9}
    // );
    // console.log(`Contract deployed to address: ${SwapMetaContract.address}`);
    // writeToEnvFile("SWAP_META", SwapMetaContract.address);

    // const DepositMetaFactory=await ethers.getContractFactory("DepositMeta")
    // const  DepositMetaContract=await DepositMetaFactory.deploy(
    //   process.env.SWAP_META,
    //   process.env.POOL_TOKEN,
    //   // {gasLimit:1e7, gasPrice:100e9}
    // )
    // console.log(`Contract deployed to address: ${DepositMetaContract.address}`);
    // writeToEnvFile("DEPOSIT_META", DepositMetaContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
