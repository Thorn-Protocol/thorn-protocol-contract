# thorn-protocol-contract

### Clone respository and setup environment

```
$ git clone https://github.com/Thorn-Protocol/thorn-protocol-contract.git
$ cd thorn-protocol-contract
$ npm install --save-dev --force
```

### Config url and ENVIRONMENT_VARIABLE in .env

Information about deployed smart contracts is located in the /deployments directory

## Table of contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Deployment](#deployment)
4. [Testing and Development](#testing-and-development)

## Overview

Thorn is an exchange liquidity pool on Sapphire designed for extremely efficient stablecoin trading and low risk, supplemental fee income for liquidity providers, without an opportunity cost.

Thorn allows user to trade between correlated cryptocurrencies with a low slippage, low fee algorithm and ensures privacy through Sapphire's confidential state features.

## Architecture

There are 5 main contract types:

-   **StableSwapFactory**: Creates new pools and provides contract infomation.
-   **Pool contracts**: Pairs stablecoins, allowing users to add or remove liquidity, and exchange tokens.
-   **StableSwapLPFactory**: Generates LP tokens rewarded to liquidity providers
-   **StableSwapRouter**: Facilitates cryptocurrency exchanges across mutiple pools.
-   **Info contracts**: Supplies information about pools

## Deployment

**Compile contract** before deploying:

```
npx hardhat compile
```

**Deploy contracts** in the order:

```
npx hardhat deploy --network <your-network>
```

## Testing and Development

### Organization and Workflow

-   New pools are creating through 'create' functions in SwapFactory contrac,by only the contract owner
-   Once created, the pools information is retrieved using 'get info' functions in SwapFactory

### Running the Tests

The [test suite](tests) common tests for pools, as well as router tests.

To run tests :

```
npx hardhat test tests/<test file name>
```
