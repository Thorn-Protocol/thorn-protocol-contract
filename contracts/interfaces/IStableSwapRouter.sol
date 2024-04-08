// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;
pragma abicoder v2;

/// @title Router token swapping functionality
/// @notice Functions for swapping tokens via Stable Swap
interface IStableSwapRouter {
    /**
    * @param path Array of token addresses in a stable swap pool.
    * @param flag Flag indicating the pool type. Use '2' for a 2-pool, '3' for a 3-pool.
    * @param amountIn Amount of the input token to be exchanged.
    * @param amountOutMin Minimum expected amount of output tokens.
    * @param to Recipient address to receive the exchanged tokens.
    */
    function exactInputStableSwap(
        address[] calldata path,
        uint256[] calldata flag,
        uint256 amountIn,
        uint256 amountOutMin,
        address to
    ) external payable returns (uint256 amountOut);

    /**
    * @param path Array of token addresses in a stable swap pool.
    * @param flag Flag indicating the pool type. Use '2' for a 2-pool, '3' for a 3-pool.
    * @param amountOut Amount of the input token to be exchanged.
    * @param amountInMax Minimum expected amount of output tokens.
     */
    function getOutputStableSwap(
        address[] calldata path,
        uint256[] calldata flag,
        uint256 amountOut,
        uint256 amountInMax
    ) external view returns (uint256 amountIn);
}
