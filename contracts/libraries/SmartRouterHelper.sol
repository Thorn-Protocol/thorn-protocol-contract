// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;
pragma abicoder v2;

import '../interfaces/IStableSwapFactory.sol';
import '../interfaces/IStableSwapInfo.sol';
import './LowGasSafeMath.sol';
import './TransferHelper.sol';
import '../interfaces/IStableSwap.sol';


library SmartRouterHelper {
    using LowGasSafeMath for uint256;

    /************************************************** Stable **************************************************/

    // get the pool info in stable swap
    function getStableInfo(
        address stableSwapFactory,
        address input,
        address output,
        uint256 flag
    ) public view returns (uint256 i, uint256 j, address swapContract) {
        if (flag == 2) {
            IStableSwapFactory.StableSwapPairInfo memory info = IStableSwapFactory(stableSwapFactory).getPairInfo(input, output);
            i = input == info.token0 ? 0 : 1;
            j = (i == 0) ? 1 : 0;
            swapContract = info.swapContract;
        } else if (flag == 3) {
            IStableSwapFactory.StableSwapThreePoolPairInfo memory info = IStableSwapFactory(stableSwapFactory).getThreePoolPairInfo(input, output);

            if (input == info.token0) i = 0;
            else if (input == info.token1) i = 1;
            else if (input == info.token2) i = 2;

            if (output == info.token0) j = 0;
            else if (output == info.token1) j = 1;
            else if (output == info.token2) j = 2;

            swapContract = info.swapContract;
        }

        require(swapContract != address(0), "getStableInfo: invalid pool address");
    }

    function getStableAmountsIn(
        address stableSwapFactory,
        address stableSwapInfo,
        address[] memory path,
        uint256[] memory flag,
        uint256 amountOut
    ) public view returns (uint256[] memory amounts) {
        uint256 length = path.length;
        require(length >= 2, "getStableAmountsIn: incorrect length");

        amounts = new uint256[](length);
        amounts[length - 1] = amountOut;

        for (uint256 i = length - 1; i > 0; i--) {
            uint256 last = i - 1;
            (uint256 k, uint256 j, address swapContract) = getStableInfo(stableSwapFactory, path[last], path[i], flag[last]);
            amounts[last] = IStableSwapInfo(stableSwapInfo).get_dx(swapContract, k, j, amounts[i], type(uint256).max);
        }
    }

    function getStableAmountsOut(
        address stableSwapFactory,
        address[] memory path,
        uint256[] memory flag,
        uint256 amountIn
    ) public view returns (uint256[] memory amounts) {
        uint256 length = path.length;
        require(length >= 2, "getStableAmountsIn: incorrect length");

        amounts = new uint256[](length);
        amounts[0] = amountIn;
        for (uint256 i =0;i< length-1; i++) {
            (uint256 k, uint256 j, address swapContract) = getStableInfo(stableSwapFactory, path[i], path[i+1], flag[i]);
             amounts[i+1] = IStableSwap(swapContract).get_dy( k, j, amounts[i]);
        }
    }

}
