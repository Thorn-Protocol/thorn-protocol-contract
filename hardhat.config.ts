import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-ethers";
import "@ethersproject/abstract-provider";
import "@ethersproject/abstract-signer";
import "@ethersproject/transactions";
import "@ethersproject/bytes";
import "@truffle/hdwallet-provider";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "hardhat-interface-generator";
import { HardhatUserConfig } from "hardhat/types";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
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
      forking: {
        url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
        blockNumber: 14390000
      },
      allowUnlimitedContractSize: true,
      // forking: {
      //   url: "https://hardcore-mayer:untrue-puppet-yearly-early-widow-spud@nd-723-346-173.p2pify.com",
      // },
      // chainId: 97,
      accounts: [
        {
          privateKey:
              "36f1ea3519a6949576c242d927dd0c74650554cdfaedbcd03fb3a80c558c03de",

          balance: "100000000000000000000000000000",
        },
        {
          privateKey:
              "37235af6356e58fd30610f5b5b3979041e029fccdfce7bf05ee868d3f7c114ec",

          balance: "100000000000000000000000000000",
        },
        {
          privateKey:
              "ddc0dbf76bd1652473690e3e67cad62a42407fa3068a0710b80481be4ef2f3bb",

          balance: "100000000000000000000000000000",
        }
      ]
      // gasPrice: 5000000000,
      // gas: 25e6,
    },
    bscTestnet: {
      url: process.env.PROVIDER_URL,
      chainId: 97,
      gasPrice: 1e10,
      // gas: 2e7,
      // gas: 1e7,
      accounts: [
        `0x${PRIVATE_KEY}`
      ]
    },
    mainnet: {
      url: "https://bsc.publicnode.com",
      chainId: 56,
      gasPrice: 3e9,
      // gas: 2e7,
      // gas: 1e5,
      accounts: [
        `0x${PRIVATE_KEY}`
      ]
    },
    sapphireTestnet: {
      url: "https://testnet.sapphire.oasis.dev/",
      chainId: 0x5aff,
      // gasPrice: 100e9,
      // gas: 1e7,
      accounts: [
        `0x${PRIVATE_KEY}`
      ]
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
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

