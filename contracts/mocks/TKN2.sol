// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TKN2 is ERC20 {
    constructor() ERC20("TKN2", "TKN2") {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function burnFrom(address _to, uint256 _amount) external {
        _burn(_to, _amount);
    }
}
