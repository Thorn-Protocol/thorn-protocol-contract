// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./StableSwapLP.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract StableSwapLPFactory is OwnableUpgradeable,PausableUpgradeable {


    /*╔══════════════════════════════╗
      ║          EVENT               ║
      ╚══════════════════════════════╝*/
     
    event NewStableSwapLP(address indexed swapLPContract, address tokenA, address tokenB, address tokenC);



    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    function initialize() public initializer {

      __Ownable_init_unchained();
      __Pausable_init_unchained();


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
