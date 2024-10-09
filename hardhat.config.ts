import { HardhatUserConfig, task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-ethers";

import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-deploy";
import dotenv from "dotenv";
dotenv.config();

const TEST_HDWALLET = {
    mnemonic: "test test test test test test test test test test test junk",
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 20,
    passphrase: "",
};

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY, process.env.SUB_PRIVATE_KEY!] : TEST_HDWALLET;

const config: HardhatUserConfig = {
    paths: {
        artifacts: "artifacts",
        cache: "cache",
        deploy: "src/deploy",
        sources: "contracts",
        tests: "tests",
    },
    namedAccounts: {
        deployer: 0,
        smartAccountOwner: 1,
        alice: 2,
        charlie: 3,
        sessionKey: 4,
    },
    solidity: {
        compilers: [
            {
                version: "0.8.24",
                settings: {
                    optimizer: { enabled: true, runs: 800 },
                    viaIR: true,
                    metadata: {
                        // do not include the metadata hash, since this is machine dependent
                        // and we want all generated code to be deterministic
                        // https://docs.soliditylang.org/en/v0.7.6/metadata.html
                        bytecodeHash: "none",
                    },
                },
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            accounts: TEST_HDWALLET,
            tags: ["hardhat"],
            initialBaseFeePerGas: 100e9,
            saveDeployments: true,
        },
        "sapphire-mainnet": {
            url: "https://sapphire.oasis.io",
            chainId: 0x5afe,
            accounts,
            live: true,
            tags: ["sapphire-mainnet"],
        },
        "sapphire-testnet": {
            url: "https://testnet.sapphire.oasis.dev",
            chainId: 0x5aff,
            accounts,
            live: true,
            tags: ["sapphire-testnet"],
        },
        "bsc-testnet": {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            accounts,
            live: true,
            chainId: 97,
            tags: ["bsc-testnet"],
        },
    },
};

export default config;
