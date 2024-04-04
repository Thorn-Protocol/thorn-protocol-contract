// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IStableSwapDeployer {

    /**
     * @dev onlyOwner
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
    ) external returns (address);

    /**
     * @dev onlyOwner
     * @param _tokenA: Addresses of ERC20 conracts .
     * @param _tokenB: Addresses of ERC20 conracts .
     * @param _tokenC: Addresses of ERC20 conracts .
     * @param _A: Amplification coefficient multiplied by n * (n - 1)
     * @param _fee: Fee to charge for exchanges
     * @param _admin_fee: Admin fee
     * @param _admin: Admin
     * @param _LP: LP
     */
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
}
