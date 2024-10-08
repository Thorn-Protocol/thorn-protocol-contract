import { ethers,deployments} from "hardhat";
import * as hre from "hardhat";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory, StableSwapInfo, StableSwapLPFactory, StableSwapRouter, StableSwapThreePool, StableSwapThreePoolDeployer, StableSwapThreePoolInfo, StableSwapTwoPoolDeployer, StableSwapTwoPoolInfo, Token } from "../typechain-types";
import { StableSwapTwoPool } from '../typechain-types/contracts/stableSwap/plain-pools/StableSwapTwoPool';
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

dotenv.config();
describe("test router", function () {
   
    before(async () => {
      
    })

    
    it("exac input swap: swap 1000 BUSD-> USDC on two pool", async () => {
    })

    it("exac input swap 1000 BUSD->USDC in two pool and swap USDC amount-> USDT in three pool", async () => {
 })

    it("get BUSD to  be needed to get 100000 USDC when you swap BUSD ->USDC in 2 pool ", async () => {

    })

    it("get BUSD to  be needed to get 100000 USDT when you swap BUSD ->USDC in 2 pool  and USDC->USDT in 3 pool", async () => {
  })

    it("get output if swap 100000n BUSD->USDC in two pool and swap USDC amount-> USDT in three pool ", async () => {
    })
})