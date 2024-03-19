const { ethers } = require("hardhat");
const { writeToEnvFile } = require("./utils/helper");

async function main() {

    // const mockTokenFactory = await ethers.getContractFactory("MockToken");
    // const mockTokenContract = await mockTokenFactory.deploy();
    // console.log(`Contract deployed to address: ${mockTokenContract.target}`);
    // writeToEnvFile("TOKEN_A", mockTokenContract.target);

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
    // console.log(`Contract deployed to address: ${SmartRouterHelperContract.target}`);
    // writeToEnvFile("SMART_ROUTER_HELPER_LIBRARY",SmartRouterHelperContract.target);

    // const StableSwapRouterFactory = await ethers.getContractFactory("StableSwapRouter",{
    //   libraries:{
    //       SmartRouterHelper: process.env.SMART_ROUTER_HELPER_LIBRARY,
    //   }
    // });
    // const StableSwapRouterContract =await StableSwapRouterFactory.deploy(process.env.STABLE_SWAP_FACTORY,process.env.STABLE_SWAP_INFO);
    // console.log(`Contract deployed to address: ${StableSwapRouterContract.target}`);
    // writeToEnvFile("STABLE_SWAP_ROUTER", StableSwapRouterContract.target);

    const StableMetaPoolFactory=await ethers.getContractFactory("StableMetaPool");
    const StableMetaPoolContract=await StableMetaPoolFactory.deploy();
    console.log(`Contract deployed to address: ${StableMetaPoolContract.target}`);
    writeToEnvFile("STABLE_META_POOL",StableMetaPoolContract.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
