import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-interface-generator";
import { HardhatUserConfig } from "hardhat/types";
import 'hardhat-deploy';
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-network-helpers";
import "hardhat-interface-generator";
import "@nomiclabs/hardhat-waffle"

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_1=process.env.PRIVATE_KEY_1;
const PRIVATE_KEY_2=process.env.PRIVATE_KEY_2;
const PRIVATE_KEY_3=process.env.PRIVATE_KEY_3;
const TEST_HDWALLET = {
  mnemonic: "test test test test test test test test test test test junk",
  path: "m/44'/60'/0'/0",
  initialIndex: 0,
  count: 6,
  passphrase: "",
  accountsBalance: "10000000000000000000000"
};

const config:HardhatUserConfig = {
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    deploy:"src/deploy_upgrade",
    artifacts: "./artifacts"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0
          }
        }
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0
          }
        }
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0
          }
        }
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 0
          }
        }
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000
          }
        }
      }
    ]
  },
  defaultNetwork: "bscTestnet",

  networks: {
    hardhat: {
      // forking: {
      //   url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      //   blockNumber: 14390000
      // },
      allowUnlimitedContractSize: true,
      // forking: {
      //   url: "https://hardcore-mayer:untrue-puppet-yearly-early-widow-spud@nd-723-346-173.p2pify.com",
      // },
      // chainId: 97,
      chainId: 31337,
      accounts: TEST_HDWALLET,
      gasPrice: 5000000000,
      gas: 25e6,
      // tags: ["hardhat"],
      // saveDeployments: true,
    },
    bscTestnet: {
      url: process.env.PROVIDER_URL,
      chainId: 97,
      gasPrice: 20000000000,
      gas: 4e7,
      // gas: 1e7,
      accounts: [
        `0x${PRIVATE_KEY}`,
        `0x${PRIVATE_KEY_1}`,
        `0x${PRIVATE_KEY_2}`,
        
      ]
    },
    mainnet: {
      url: "https://bsc.publicnode.com",
      chainId: 56,
      gasPrice: 3e9,
      // gas: 2e7,
      // gas: 1e5,
      accounts: [
        `0x${PRIVATE_KEY}`,
      ]
    },
    sapphireTestnet: {
      url: "https://testnet.sapphire.oasis.dev/",
      chainId: 0x5aff,
      gasPrice: 100e9,
      gas: 1e7,
      accounts: [
        `0x${PRIVATE_KEY}`,
        `0x${PRIVATE_KEY_1}`,
        `0x${PRIVATE_KEY_2}`,
        `0x${PRIVATE_KEY_3}`
      ],
     
      // tags:["sapphireTestnet"]
    },
    sapphireMainnet: {
      url: "https://sapphire.oasis.io/",
      chainId: 23294,
      // gasPrice: 4e7,
      // gas: 2e7,
      accounts: [
        `0x${PRIVATE_KEY}`
      ]
    }
  },
  // paths: {
  //   sources: "./contracts",
  //   tests: "./test",
  //   cache: "./cache",
  //   artifacts: "./artifacts"
  // }
};

export default config;
