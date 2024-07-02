
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {deployments} from'hardhat';
import {DeployFunction} from 'hardhat-deploy/types'
import * as dotenv from "dotenv";
import { writeToEnvFile } from "../../scripts/utils/helper";

dotenv.config();


const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments} = hre;
  const {deploy} = deployments;
  const[deployer] = await hre.getUnnamedAccounts();
  console.log(deployer);
  let tx= await deploy("StableSwapFactory", {
    from: deployer,
    proxy: {
        owner: deployer,
        execute: 
        {
            
            init:  {
              methodName: "initialize",
              args: [
                process.env.STABLE_SWAP_LP_FACTORY,
                process.env.STABLE_SWAP_TWO_POOL_DEPLOYER,
                process.env.STABLE_SWAP_THREE_POOL_DEPLOYER,
                process.env.PUBLIC_KEY
              ],
          },
        },
            
    }, 
    
    log: true,
    skipIfAlreadyDeployed: false,
  });
  console.log("hello",tx.address);
};
deploy.tags = ['stableswapFactory'];
export default deploy;