// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IStableSwapDeployer {
    function createSwapPair(
        address _tokenA,
        address _tokenB,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee,
        address _admin,
        address _LP
    ) external returns (address);

    function createSwapPair(
        address _tokenA,
        address _tokenB,
        address _tokenC,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee,
        address _admin,
        address _LP
    ) external returns (address);

    function createLendingSwapPair(
        address[2] memory _coins,
        address[2] memory _underlying_coins,
        address _pool_token,
        address _trava_lending_pool,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee,
        uint256 _offpeg_fee_multiplier,
        address _admin
    ) external returns (address);
}
