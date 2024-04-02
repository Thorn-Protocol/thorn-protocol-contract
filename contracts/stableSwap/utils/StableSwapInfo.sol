// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/IStableSwapInfo.sol";
import "../../interfaces/IStableSwap.sol";

/**
 * @title StableSwapInfo
 * @notice Contract for retrieving information about stable swaps
 * @dev This contract provides functions to retrieve information about stable swaps with 2 or 3 coins
 */
contract StableSwapInfo {
    IStableSwapInfo public immutable twoPoolInfo;
    IStableSwapInfo public immutable threePoolInfo;

    constructor(IStableSwapInfo _twoPoolInfo, IStableSwapInfo _threePoolInfo) {
        twoPoolInfo = _twoPoolInfo;
        threePoolInfo = _threePoolInfo;
    }

    
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
    ) external view returns (uint256 dx) {
        uint256 N_COINS = IStableSwap(_swap).N_COINS();
        if (N_COINS == 2) {
            dx = twoPoolInfo.get_dx(_swap, i, j, dy, max_dx);
        } else if (N_COINS == 3) {
            dx = threePoolInfo.get_dx(_swap, i, j, dy, max_dx);
        }
    }
}
