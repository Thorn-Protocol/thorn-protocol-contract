// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("A Token", "AT") {
         _mint(msg.sender, 10000 * (10**decimals()));
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function burnFrom(address _to, uint256 _amount) external {
        _burn(_to, _amount);
    }
}
