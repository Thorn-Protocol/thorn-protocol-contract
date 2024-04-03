// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IStableSwapLP {
    /**
     * @notice Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Creates new tokens and assigns them to a specified address.
     * @param _to Address to which the newly created tokens will be assigned.
     * @param _amount Amount of tokens to be created and assigned.
     */
    function mint(address _to, uint256 _amount) external;

    /**
     * @notice Burns a specific amount of tokens from a specified address.
     * @param _to Address from which tokens will be burned.
     * @param _amount Amount of tokens to be burned.
     */
    function burnFrom(address _to, uint256 _amount) external;

    /**
     * @notice Sets a new minter address.
     * @param _newMinter Address of the new minter.
     */
    function setMinter(address _newMinter) external;
}
