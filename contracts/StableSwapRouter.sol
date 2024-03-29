// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.6;
pragma abicoder v2;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './interfaces/IStableSwapRouter.sol';
import './interfaces/IStableSwap.sol';
import './libraries/SmartRouterHelper.sol';
import './libraries/Constants.sol';
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/// @title Stable Swap Router
contract StableSwapRouter is IStableSwapRouter, OwnableUpgradeable,ReentrancyGuardUpgradeable  {
    address public stableSwapFactory;
    address public stableSwapInfo;


   /*╔══════════════════════════════╗
     ║          EVENT               ║
     ╚══════════════════════════════╝*/

    event SetStableSwap(address indexed factory, address indexed info);

     
    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    function initialize(
        address _stableSwapFactory,
        address _stableSwapInfo
    ) public initializer {
        stableSwapFactory = _stableSwapFactory;
        stableSwapInfo = _stableSwapInfo;
    }


    /*╔══════════════════════════════╗
      ║          ADMIN FUNCTIONS     ║
      ╚══════════════════════════════╝*/

    /**
     * @notice Set Stable Swap Factory and Info
     * @dev Only callable by contract owner
     */
    function setStableSwap(
        address _factory,
        address _info
    ) external onlyOwner {
        require(_factory != address(0) && _info != address(0));

        stableSwapFactory = _factory;
        stableSwapInfo = _info;

        emit SetStableSwap(stableSwapFactory, stableSwapInfo);
    }

    /*╔══════════════════════════════╗
      ║          FUNCTIONS           ║
      ╚══════════════════════════════╝*/

   
    function _swap(
        address[] memory path,
        uint256[] memory flag
    ) private {
        require(path.length - 1 == flag.length);

        for (uint256 i; i < flag.length; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (uint256 k, uint256 j, address swapContract) = SmartRouterHelper.getStableInfo(stableSwapFactory, input, output, flag[i]);
            uint256 amountIn_ = IERC20(input).balanceOf(address(this));
            TransferHelper.safeApprove(input, swapContract, amountIn_);
            IStableSwap(swapContract).exchange(k, j, amountIn_, 0);
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
    ) external payable  nonReentrant returns (uint256 amountOut) {
        IERC20 srcToken = IERC20(path[0]);
        IERC20 dstToken = IERC20(path[path.length - 1]);

        // use amountIn == Constants.CONTRACT_BALANCE as a flag to swap the entire balance of the contract
        bool hasAlreadyPaid;
        if (amountIn == Constants.CONTRACT_BALANCE) {
            hasAlreadyPaid = true;
            amountIn = srcToken.balanceOf(address(this));
        }

        if (!hasAlreadyPaid) {
            pay(address(srcToken), msg.sender, address(this), amountIn);
        }

        _swap(path, flag);

        amountOut = dstToken.balanceOf(address(this));
        require(amountOut >= amountOutMin);

        // find and replace to addresses
        if (to == Constants.MSG_SENDER) to = msg.sender;
        else if (to == Constants.ADDRESS_THIS) to = address(this);

        if (to != address(this)) pay(address(dstToken), address(this), to, amountOut);
    }

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
    ) external view returns (uint256 amountIn) {
        amountIn = SmartRouterHelper.getStableAmountsIn(stableSwapFactory, stableSwapInfo, path, flag, amountOut)[0];
        require(amountIn <= amountInMax,"The amount of token is greater than expected");
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
            TransferHelper.safeTransfer(token, recipient, value);
        } else {
            TransferHelper.safeTransferFrom(token, payer, recipient, value);
        }
    }
}