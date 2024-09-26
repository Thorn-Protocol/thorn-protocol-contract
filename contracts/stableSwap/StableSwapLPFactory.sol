// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./StableSwapLP.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title stable swap LP factory 
 * @notice A LP factory contract for creating LP tokens for stable swap pools
 * @dev This contract manages the creation of LP tokens for stable swap pools
 */

contract StableSwapLPFactory is Ownable,Pausable {


    /*╔══════════════════════════════╗
      ║          EVENT               ║
      ╚══════════════════════════════╝*/
     
    event NewStableSwapLP(address indexed swapLPContract, address tokenA, address tokenB, address tokenC);



    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    constructor() {
    }


    /*╔══════════════════════════════╗
      ║      ADMIN FUNCTIONS         ║
      ╚══════════════════════════════╝*/

    /**
    * @notice  onlyOwner
    * @dev     pauseContract
    */
    function pauseContract() external onlyOwner(){ _pause();}

    /**
    * @notice  onlyOwner
    * @dev     unpauseContract
    */
    function unPauseContract() external onlyOwner(){ _unpause();}

    /**
     * @notice createSwapLP
     * @param _tokenA: Addresses of ERC20 conracts .
     * @param _tokenB: Addresses of ERC20 conracts .
     * @param _tokenC: Addresses of ERC20 conracts .
     * @param _minter: Minter address
     */
    function createSwapLP(
        address _tokenA,
        address _tokenB,
        address _tokenC,
        address _minter
    ) external onlyOwner returns (address) {
        // create LP token
        bytes memory bytecode = type(StableSwapLP).creationCode;
        bytes32 salt = keccak256(
            abi.encodePacked(_tokenA, _tokenB, _tokenC, msg.sender, block.timestamp, block.chainid)
        );
        address lpToken;
        assembly {
            lpToken := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        StableSwapLP(lpToken).setMinter(_minter);
        emit NewStableSwapLP(lpToken, _tokenA, _tokenB, _tokenC);
        return lpToken;
    }
}
