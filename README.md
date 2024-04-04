# thorn-protocol-contract

### Clone respository and setup environment
```
$ git clone https://github.com/Thorn-Protocol/thorn-protocol-contract.git
$ cd thorn-protocol-contract 
$ npm install --save-dev --force
```
### Config url and ENVIRONMENT_VARIABLE in .env
- Copy and update from .env_example_bsc_testnet for bsc testnet network 
- Copy and update from .env_example_oasis_sapphire_mainnet for sapphire oasis network 


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
+ **StableSwapFactory**: Creates new pools and provides contract infomation.
+ **Pool contracts**: Pairs stablecoins, allowing users to add or remove liquidity, and exchange tokens.
+ **StableSwapLPFactory**: Generates LP tokens rewarded to liquidity providers
+ **StableSwapRouter**: Facilitates cryptocurrency exchanges across mutiple pools.
+ **Info contracts**: Supplies information about pools

## Deployment

**Compile contract**  before deploying:
```
npx hardhat compile
```
**Deploy  4 contracts** in the following order: 
```
npx hardhat run scripts/deploy-upgrades/1-deploy-LP-factory.ts
npx hardhat run scripts/deploy-upgrades/2-deploy-two-pool-deployer.ts
npx hardhat run scripts/deploy-upgrades/3-deploy-three-pool-deployer.ts
npx hardhat run scripts/deploy-upgrades/4-deploy-stable-swap-factory.ts 
```
After completely deploying 4 contracts, navigate to the contract deploy files excluding **stable swap factory** deploy file. Comment out the **deploy** function in **main**, and uncomment **setup** function. Then, only run the first three commands above.

Once the contracts are fully set up, procceed with the deployment: 

```
npx hardhat run scripts/deploy-upgrades/5-deploy-two-pool-info.ts
npx hardhat run scripts/deploy-upgrades/6-deploy-three-pool-info.ts
npx hardhat run scripts/deploy-upgrades/7-deploy-stable-swap-info.ts
npx hardhat run scripts/deploy-upgrades/8-deploy-smart-router-helper.ts
npx hardhat run scripts/deploy-upgrades/9-deploy-stable-swap-router.ts
```

## Testing and Development

### Organization and Workflow

* New pools are creating through 'create' functions in SwapFactory contrac,by only the contract owner
* Once created, the pools information is  retrieved using 'get info' functions in SwapFactory 


### Running the Tests

The [test suite](tests) common tests for pools, as well as router tests.

To run tests : 

```
npx hardhat test tests/<test file name>
```





