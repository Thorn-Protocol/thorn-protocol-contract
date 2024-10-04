import { HardhatUserConfig, task } from "hardhat/config";
import "@oasisprotocol/sapphire-hardhat";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-network-helpers";
//import "@nomicfoundation/hardhat-ethers";
//import "@nomicfoundation/hardhat-chai-matchers";
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
        tests: "test",
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
    deterministicDeployment: {
        "31337": {
            factory: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
            deployer: "0xE1CB04A0fA36DdD16a06ea828007E35e1a3cBC37",
            funding: (100e9 * 1e5).toString(),
            signedTx:
                "0xf8a78085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf382f4f5a00dc4d1d21b308094a30f5f93da35e4d72e99115378f135f2295bea47301a3165a0636b822daad40aa8c52dd5132f378c0c0e6d83b4898228c7e21c84e631a0b891",
        },
        "23295": {
            factory: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
            deployer: "0xE1CB04A0fA36DdD16a06ea828007E35e1a3cBC37",
            funding: (100e9 * 1e5).toString(),
            signedTx:
                "0xf8a78085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf382b622a044ac748b68fe9b7ae964f2a272637b422b06981c8690ff57fa535c3a09851b69a060bc54c8ecc62cc2565c30a7be4b044c8e1997084b69e9036108818d13eaa2bf",
        },
        "23294": {
            factory: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
            deployer: "0xE1CB04A0fA36DdD16a06ea828007E35e1a3cBC37",
            funding: (100e9 * 1e5).toString(),
            signedTx:
                "0xf8a78085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf382b620a0322f1c093633d4d1ace847573bf236ba2f66210952824ac47d65b445fedfb985a058b9dbaf0a2f88df0116ceb3d49b489ca7d5e72932802ac12885dc0e3ada3903",
        },
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
        "sapphire-localnet": {
            url: "http://localhost:8545",

            accounts: TEST_HDWALLET,
            chainId: 0x5afd,
            tags: ["sapphire-localnet"],
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
