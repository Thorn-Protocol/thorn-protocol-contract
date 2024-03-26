// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./StableSwapTwoPool.sol";
import "././lending/lendingpool.sol";

contract StableSwapTwoPoolDeployer is Ownable {
    uint256 public constant N_COINS = 2;

    /**
     * @notice constructor
     */
    constructor() {}

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    /**
     * @notice createSwapPair
     * @param _tokenA: Addresses of ERC20 conracts .
     * @param _tokenB: Addresses of ERC20 conracts .
     * @param _A: Amplification coefficient multiplied by n * (n - 1)
     * @param _fee: Fee to charge for exchanges
     * @param _admin_fee: Admin fee
     * @param _admin: Admin
     * @param _LP: LP
     */
    function createSwapPair(
        address _tokenA,
        address _tokenB,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee,
        address _admin,
        address _LP
    ) external onlyOwner returns (address) {
        require(_tokenA != address(0) && _tokenB != address(0) && _tokenA != _tokenB, "Illegal token");
        (address t0, address t1) = sortTokens(_tokenA, _tokenB);
        address[N_COINS] memory coins = [t0, t1];
        // create swap contract
        bytes memory bytecode = type(StableSwapTwoPool).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(t0, t1, msg.sender, block.timestamp, block.chainid));
        address swapContract;
        assembly {
            swapContract := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        StableSwapTwoPool(swapContract).initialize(coins, _A, _fee, _admin_fee, _admin, _LP);

        return swapContract;
    }

    function createLendingSwapPair(
        address[N_COINS] memory _coins,
        address[N_COINS] memory _underlying_coins,
        address _pool_token,
        address _trava_lending_pool,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee,
        uint256 _offpeg_fee_multiplier,
        address _admin
    ) external  returns (address) {

        for (uint8 i = 0; i < N_COINS; i++) {
            require(_coins[i] != address(0), "Coin address cannot be zero");
            require(_underlying_coins[i] != address(0), "Underlying coin address cannot be zero");
        }
        // address[N_COINS] memory coins = [t0, t1, t2];
        // create swap contract
        bytes memory bytecode = type(LendingTravaPool).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_coins[0], _coins[1], msg.sender, block.timestamp, block.chainid));
        address swapContract;
        assembly {
            swapContract := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        LendingTravaPool(swapContract).initialize(_coins,_underlying_coins,_pool_token, _trava_lending_pool,_A,_fee,_admin_fee,_offpeg_fee_multiplier,_admin);
       return swapContract;


    }
}
