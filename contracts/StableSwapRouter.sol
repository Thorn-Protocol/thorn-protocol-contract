// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IStableSwapRouter.sol";
import "./interfaces/IStableSwap.sol";
import "./interfaces/IWROSE.sol";
import "./libraries/SmartRouterHelper.sol";
import "./libraries/Constants.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Stable Swap Router
/// @notice A router contract for excuting stable swaps between different stablecoins pairs through mutiple pools
///         It allows users to swap stable coins efficiently
/// @dev    This contract manages stable swap functionality, including executing swaps and caculating swap amounts

contract StableSwapRouter is IStableSwapRouter, Ownable, ReentrancyGuard {
    address public WROSE;

    address public stableSwapFactory;
    address public stableSwapInfo;

    address public constant ROSE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    bool public isKill;

    /*╔══════════════════════════════╗
     ║          EVENT               ║
     ╚══════════════════════════════╝*/

    event SetStableSwap(address indexed factory, address indexed info);

    event StableExchange(
        address indexed buyer,
        uint256 amountIn,
        address indexed token1,
        uint256 amountOut,
        address indexed token2,
        address recipient
    );

    receive() external payable {}

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    constructor(address _stableSwapFactory, address _stableSwapInfo) {
        stableSwapFactory = _stableSwapFactory;
        stableSwapInfo = _stableSwapInfo;
        isKill = false;
    }

    /*╔══════════════════════════════╗
      ║          ADMIN FUNCTIONS     ║
      ╚══════════════════════════════╝*/

    /**
     * @notice Set Stable Swap Factory and Info
     * @dev Only callable by contract owner
     */
    function setStableSwap(address _factory, address _info) external onlyOwner {
        require(_factory != address(0) && _info != address(0));

        stableSwapFactory = _factory;
        stableSwapInfo = _info;

        emit SetStableSwap(stableSwapFactory, stableSwapInfo);
    }

    /*╔══════════════════════════════╗
      ║          FUNCTIONS           ║
      ╚══════════════════════════════╝*/

    function _swap(address[] memory path, uint256[] memory flag) private {
        uint256 amountIn_;
        require(path.length - 1 == flag.length);
        for (uint256 i; i < flag.length; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (uint256 k, uint256 j, address swapContract) = SmartRouterHelper
                .getStableInfo(stableSwapFactory, input, output, flag[i]);
            if (input == ROSE) {
                amountIn_ = address(this).balance;
                IStableSwap(swapContract).exchange{value: amountIn_}(
                    k,
                    j,
                    amountIn_,
                    0
                );
            }
            if (input != ROSE) {
                amountIn_ = IERC20(input).balanceOf(address(this));
                TransferHelper.safeApprove(input, swapContract, amountIn_);
                IStableSwap(swapContract).exchange(k, j, amountIn_, 0);
            }
        }
    }

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
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(!isKill, "Contract is killed");
        address srcToken = path[0];
        address dstToken = path[path.length - 1];

        // use amountIn == Constants.CONTRACT_BALANCE as a flag to swap the entire balance of the contract

        bool hasAlreadyPaid;
        if (amountIn == Constants.CONTRACT_BALANCE) {
            hasAlreadyPaid = true;
            if (srcToken == ROSE) {
                amountIn = address(this).balance;
            } else {
                amountIn = IERC20(srcToken).balanceOf(address(this));
            }
        }

        if (!hasAlreadyPaid) {
            if (srcToken == ROSE) {
                require(msg.value == amountIn, "Invalid msg.value");
            } else {
                pay(srcToken, msg.sender, address(this), amountIn);
            }
        }
        _swap(path, flag);

        if (dstToken == ROSE) {
            amountOut = address(this).balance;
        } else {
            amountOut = IERC20(dstToken).balanceOf(address(this));
        }

        require(amountOut >= amountOutMin);

        // find and replace to addresses
        if (to == Constants.MSG_SENDER) to = msg.sender;
        else if (to == Constants.ADDRESS_THIS) to = address(this);

        if (to != address(this)) {
            pay(dstToken, address(this), to, amountOut);
        }

        emit StableExchange(
            msg.sender,
            amountIn,
            path[0],
            amountOut,
            path[path.length - 1],
            to
        );
    }

    /**
     * @param path Array of token addresses in a stable swap pool.
     * @param flag Flag indicating the pool type. Use '2' for a 2-pool, '3' for a 3-pool.
     * @param amountIn Amount of the exchanged token .
     * @param amountOutMin Minimum expected amount of output tokens.
     */
    function getOutputStableSwap(
        address[] calldata path,
        uint256[] calldata flag,
        uint256 amountIn,
        uint256 amountOutMin
    ) external view returns (uint256 amountOut) {
        amountOut = SmartRouterHelper.getStableAmountsOut(
            stableSwapFactory,
            path,
            flag,
            amountIn
        )[path.length - 1];
        require(
            amountOut >= amountOutMin,
            "The amount of token is smaller than expected"
        );
        return amountOut;
    }

    /**
     * @param path Array of token addresses in a stable swap pool.
     * @param flag Flag indicating the pool type. Use '2' for a 2-pool, '3' for a 3-pool.
     * @param amountOut Amount of the redeemed token .
     * @param amountInMax Maximum expected amount of output tokens.
     */
    function getInputStableSwap(
        address[] calldata path,
        uint256[] calldata flag,
        uint256 amountOut,
        uint256 amountInMax
    ) external view returns (uint256 amountIn) {
        amountIn = SmartRouterHelper.getStableAmountsIn(
            stableSwapFactory,
            stableSwapInfo,
            path,
            flag,
            amountOut
        )[0];
        require(
            amountIn <= amountInMax,
            "The amount of token is greater than expected"
        );
        return amountIn;
    }

    /**
     * @dev Internal function to facilitate token payments between addresses.
     * If the payer is this contract, it directly transfers tokens to the recipient.
     * If the payer is not this contract, it transfers tokens from the payer to the recipient.
     * @param token The address of the token being transferred.
     * @param payer The address of the entity initiating the payment.
     * @param recipient The address of the entity receiving the payment.
     * @param value The amount of tokens to be transferred.
     */
    function pay(
        address token,
        address payer,
        address recipient,
        uint256 value
    ) internal {
        if (payer == address(this)) {
            if (token == ROSE) {
                TransferHelper.safeTransferROSE(recipient, value);
            } else {
                TransferHelper.safeTransfer(token, recipient, value);
            }
        } else {
            TransferHelper.safeTransferFrom(token, payer, recipient, value);
        }
    }

    function kill() external onlyOwner {
        isKill = true;
    }

    function unKill() external onlyOwner {
        isKill = false;
    }
}
