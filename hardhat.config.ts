import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-tracer";
import "hardhat-deploy";
import dotenv from "dotenv";
import "@oasisprotocol/sapphire-paratime";
import "@oasisprotocol/sapphire-hardhat";
dotenv.config();
import colors from "colors";

colors.setTheme({
    silly: "rainbow",
    input: "grey",
    verbose: "cyan",
    prompt: "grey",
    info: "green",
    data: "grey",
    help: "cyan",
    warn: "yellow",
    debug: "blue",
    error: "red",
});

const TEST_HDWALLET = {
    mnemonic: "test test test test test test test test test test test junk",
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 20,
    passphrase: "",
};

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : TEST_HDWALLET;

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
        sapphire_mainnet: {
            url: "https://sapphire.oasis.io",
            chainId: 0x5afe,
            accounts,
            live: true,
            tags: ["sapphire-mainnet"],
        },
        sapphire_testnet: {
            url: "https://testnet.sapphire.oasis.io",
            chainId: 0x5aff,
            accounts,
            live: true,
            tags: ["sapphire-testnet"],
        },
    },
};

export default config;
