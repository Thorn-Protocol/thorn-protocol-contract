// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;
pragma abicoder v2;

interface IStableSwapFactory {
    struct StableSwapPairInfo {
        address swapContract;
        address token0;
        address token1;
        address LPContract;
    }

    struct StableSwapThreePoolPairInfo {
        address swapContract;
        address token0;
        address token1;
        address token2;
        address LPContract;
    }

    // solium-disable-next-line mixedcase
    function pairLength() external view returns (uint256);

    /**
    * @notice Retrieves information of two pool.
    * @param _tokenA : Addresses of ERC20 conracts.
    * @param _tokenB : Addresses of ERC20 conracts.
    */
    function getPairInfo(address _tokenA, address _tokenB)
    external
    view
    returns (StableSwapPairInfo memory info);

    /**
    * @notice Retrieves information of three pool.
    * @param _tokenA : Addresses of ERC20 conracts.
    * @param _tokenB : Addresses of ERC20 conracts.
    */
    function getThreePoolPairInfo(address _tokenA, address _tokenB)
    external
    view
    returns (StableSwapThreePoolPairInfo memory info);
}
