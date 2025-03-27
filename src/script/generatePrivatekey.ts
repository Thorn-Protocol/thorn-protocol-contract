import { ethers } from "hardhat";

async function generatorPrivateKey() {
    const wallet = ethers.Wallet.createRandom();
    console.log(wallet.privateKey);
}
generatorPrivateKey();
