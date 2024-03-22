import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ERC20, StableSwapFactory } from "../typechain-types";
dotenv.config();

describe("StableSwapTwoPool Contract Tests", function () {
    let factory: StableSwapFactory;
    let tokenA: ERC20;
    let tokenC: ERC20;

    before(async function () {
        factory = await ethers.getContractAt("StableSwapFactory", process.env.STABLE_SWAP_FACTORY!);
        tokenA = await ethers.getContractAt("ERC20", process.env.TOKEN_A!);
        tokenC = await ethers.getContractAt("ERC20", process.env.TOKEN_C!);
    });

//     it("should transfer ownership", async function () {
//         // const StableSwapLPFactory =await  ethers.getContractAt("StableSwapLPFactory", process.env.STABLE_SWAP_LP_FACTORY);
//         // const StableSwapTwoPoolDeployer =await  ethers.getContractAt("StableSwapTwoPoolDeployer", process.env.STABLE_SWAP_TWO_POOL_DEPLOYER);
//         const StableSwapThreePoolDeployer =await  ethers.getContractAt("StableSwapThreePoolDeployer", process.env.STABLE_SWAP_THREE_POOL_DEPLOYER!);
//         let tx = await StableSwapThreePoolDeployer.transferOwnership(process.env.STABLE_SWAP_FACTORY);
//         await tx.wait();
//         console.log(tx);
//     });

//     it("should create 2pool pair", async function () {
//         const tx=await  factory.createSwapPair(
//             process.env.TOKEN_A,
//             process.env.TOKEN_C,
//             1000,
//             4000000,
//             5000000000
//         )
//         await tx.wait();
//         console.log(tx);
//     });

    it("should retrieve 2pool pair information", async function () {
        const pair= await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
        console.log(pair);
    });

//     it("should add liquidity to 2pool", async function () {
//         const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
//         const StableSwapTwoPool=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
   
// //     console.log(await tokenA.balanceOf("0xa4F816D2f1801051484AeF1fD8e1e4e59C6Bf76F"));
// //     console.log(await tokenC.balanceOf("0xa4F816D2f1801051484AeF1fD8e1e4e59C6Bf76F"));
   
//         let tx=await tokenA.approve(pairInfo[0],1e6)
//         await  tx.wait();
//         let tx1=await tokenC.approve(pairInfo[0],1e6)
//         await  tx1.wait();

//         const tx2=await StableSwapTwoPool.add_liquidity([1e6,1e6], 0)
//         await tx2.wait();
//         console.log(tx2);
//     });

//     it("should perform token exchange in 2pool", async function () {
//         const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
//         const StableSwapTwoPool=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);

//         let tx=await tokenA.approve(pairInfo[0],100000000000000n)
//         await  tx.wait();

//         const tx1=await StableSwapTwoPool.exchange(0,1,100000000000000n,0)
//         await tx1.wait();
//         console.log(tx1);
//     });

//     it("should remove liquidity from 2pool", async function () {
//         const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_C)
//         const StableSwapTwoPool=await  ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);

//         const lptoken = await ethers.getContractAt("ERC20", pairInfo[3]);
//         console.log(await lptoken.balanceOf(process.env.PUBLIC_KEY));

//         const tx=await StableSwapTwoPool.remove_liquidity(1998667333531366n, [0,0]);
//         await tx.wait();
//         console.log(tx);
//     });

//     it("should retrieve balances for 2pool", async function () {
//         const pairInfo = await factory.getPairInfo(process.env.TOKEN_A, process.env.TOKEN_B)
//         const StableSwapTwoPool= await ethers.getContractAt("StableSwapTwoPool", pairInfo[0]);
//         let tx = await StableSwapTwoPool.admin_balances(pairInfo[0]);
//         console.log(tx);
//     });
});
