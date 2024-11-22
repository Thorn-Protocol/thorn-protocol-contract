// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC2Mintable is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20("TKN1", "TKN1") {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
