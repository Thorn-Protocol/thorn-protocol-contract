// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;
pragma abicoder v2;

interface IStableSwapInfo {
    /**
     * @notice get amountIn  with the given amount out  
     * @param _swap: Addresses of pool conracts .
     * @param i: the token index.
     * @param j: the token index 
     * @param  dy :  the given amount out
     * @param max_dx: the maximum of amount in 
     */
    function get_dx(
        address _swap,
        uint256 i,
        uint256 j,
        uint256 dy,
        uint256 max_dx
    ) external view returns (uint256);
}
