// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;
pragma abicoder v2;

interface IStableSwapThreePoolInfo {

    /**
     * @notice Get the LP token of the two pool
     * @param _swap Address of the stable swap contract
     */
    function token(address _swap) external view returns (address);

     /**
     * @notice Get the balances of each coin in the pool
     * @param _swap Address of the stable swap contract
     */
    function balances(address _swap) external view returns (uint256[3] memory swapBalances);

    /**
     * @notice Get the exchange rates for each coin in the pool
     * @param _swap Address of the stable swap contract
     */
    function RATES(address _swap) external view returns (uint256[3] memory swapRATES);

    /**
     * @notice Get the precision multipliers for each coin in the pool
     * @param _swap Address of the stable swap contract
     */
    function PRECISION_MUL(address _swap) external view returns (uint256[3] memory swapPRECISION_MUL);

    /**
     * @notice Calculate the amount of each coin received when removing liquidity 
     * @param _swap Address of the stable swap contract
     * @param _amount Amount of LP tokens to burn in the withdrawal
     */
    function calc_coins_amount(address _swap, uint256 _amount) external view returns (uint256[3] memory);

    /**
    * @notice Calculates the total value of the pool's assets (invariant D), given balances and amplification factor.
    * @param _balances Array of balances to calculate virtual balances from.
    * @param amp Amplification factor of the pool.
    */
    function get_D_mem(
        address _swap,
        uint256[3] memory _balances,
        uint256 amp
    ) external view returns (uint256);

    /**
     * @notice Calculate the amount of LP token received when adding liquidity
     * @param _swap Address of the stable swap contract
     * @param amounts Array of amounts for each coin being deposited
     */
    function get_add_liquidity_mint_amount(address _swap, uint256[3] memory amounts)
        external
        view
        returns (uint256);
    
    /**
     * @notice Calculate the fee charged when adding liquidity
     * @param _swap Address of the stable swap contract
     * @param amounts Array of amounts for each coin being deposited
     */
    function get_add_liquidity_fee(address _swap, uint256[3] memory amounts)
        external
        view
        returns (uint256[3] memory liquidityFee);

    /**
     * @notice Calculate the fee charged when removing liquidity
     * @param _swap Address of the stable swap contract
     * @param amounts Array of amounts for each coin being withdrawn
     */
    function get_remove_liquidity_imbalance_fee(address _swap, uint256[3] memory amounts)
        external
        view
        returns (uint256[3] memory liquidityFee);

    /**
    * @notice Calculates the array of virtual balances for the pool, scaled by precision, using provided balances.
    * @param _balances The array of balances to calculate virtual balances from.
    */
    function _xp_mem(address _swap, uint256[3] memory _balances)
        external
        view
        returns (uint256[3] memory result);

    /**
    * @notice Calculates the exchange fee and admin fee for a token swap
    * @param _swap Address of the stable swap contract
    * @param i Index of the token to swap from
    * @param j Index of the token to swap to
    * @param dx Amount of token to swap from
    * @return exFee Exchange fee for the swap
    * @return exAdminFee Admin fee for the swap
    */
    function get_exchange_fee(
        address _swap,
        uint256 i,
        uint256 j,
        uint256 dx
    ) external view returns (uint256 exFee, uint256 exAdminFee);

    /**
     * @notice Calculate the fee charged when removing liquidity for a single coin
     * @param _swap Address of the stable swap contract
     * @param _token_amount Amount of liquidity tokens being withdrawn
     * @param i Index of the coin to withdraw
     */
    function get_remove_liquidity_one_coin_fee(
        address _swap,
        uint256 _token_amount,
        uint256 i
    ) external view returns (uint256 adminFee);

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
    ) external view returns (uint256);
}
