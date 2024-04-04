// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IStableSwap {

    /**
     * @notice Get the LP token of the two pool
     */
    function token() external view returns (address);

    /**
     * @notice Get the balances of each coin in the pool
     * @param i Coin index
     */
    function balances(uint256 i) external view returns (uint256);

    /**
     * @notice Get the number of coins within the pool
     */
    function N_COINS() external view returns (uint256);

    /**
     * @notice Get the exchange rates for each coin in the pool
     * @param i Coin index
     */
    function RATES(uint256 i) external view returns (uint256);

    /**
     * @notice Get the address of coin in the pool
     * @param i Coin index
     */
    function coins(uint256 i) external view returns (address);

    /**
     * @notice Get the precision multipliers for each coin in the pool
     * @param i Coin index
     */
    function PRECISION_MUL(uint256 i) external view returns (uint256);

    /**
     * @notice The pool swap fee.
     * The method returns fee as an integer with 1e10 precision.
     */
    function fee() external view returns (uint256);

    /**
     * @notice The percentage of the swap fee that is taken as an admin fee.
     * The method returns an integer with with 1e10 precision.
     */
    function admin_fee() external view returns (uint256);

    /**
     * @notice Getter for the amplification coefficient of the pool.
     * The amplification coefficient A determines a pool’s tolerance for imbalance between the assets within it.
     */
    function A() external view returns (uint256);

    /**
    * @notice Current virtual price of the pool LP token relative to the underlying pool assets.
    * Can get the absolute price by multiplying it with the price of the underlying assets.
    * The method returns virtual_price as an integer with 1e18 precision.
    */
    function get_virtual_price() external view returns (uint256);

    /**
     * @notice Calculate addition or reduction in token supply from a deposit or withdrawal
     * Returns the expected amount of LP tokens received. 
     * This calculation accounts for slippage, but not fees.
     * @param amounts: Amount of each coin being deposited
     * @param deposit: Set True for deposits, False for withdrawals
     */
    function calc_token_amount(uint256[2] memory amounts, bool deposit) external view returns (uint256);
    function calc_token_amount(uint256[3] memory amounts, bool deposit) external view returns (uint256);


    /**
     * @notice Get the amount of coin j one would receive for swapping dx of coin i.
     * @param i: Index of coin to swap from
     * @param j: Index of coin to swap to
     * @param dx: Amount of coin i to swap
     */
    function get_dy(
        uint256 i,
        uint256 j,
        uint256 dx
    ) external view returns (uint256);

    /**
    * @notice Get the amount of coin j one would receive for swapping dx of coin i, in underlying units.
    * @param i Index of coin to swap from
    * @param j Index of coin to swap to
    * @param dx Amount of coin i to swap
    */
    function get_dy_underlying(
        uint256 i,
        uint256 j,
        uint256 dx
    ) external view returns (uint256);

    /**
     * @notice Calculate the amount received when withdrawing a single coin.
     * @param _token_amount: Amount of LP tokens to burn in the withdrawal
     * @param i: Index value of the coin to withdraw
     */
    function calc_withdraw_one_coin(uint256 _token_amount, uint256 i) external view returns (uint256);

    /**
     * @notice Deposit coins into the pool
     * @param amounts: Amount of each coin being deposited
     * @param min_mint_amount: Minimum amount of LP tokens to mint from the deposit
     */
    function add_liquidity(uint256[2] memory amounts, uint256 min_mint_amount) external payable;
    function add_liquidity(uint256[3] memory amounts, uint256 min_mint_amount) external payable;

    /**
     * @notice Perform an exchange between two coins.
     * @param i: Index of coin to swap from
     * @param j: Index of coin to swap to
     * @param dx: Amount of coin i to swap
     * @param min_dy: 	Minimum amount of j to receive
     */
    function exchange(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 min_dy
    ) external payable;

     /**
     * @notice Withdraw coins from the pool
     * @param _amount: Quantity of LP tokens to burn in the withdrawal
     * @param min_amounts: Minimum amounts of underlying coins to receive
     */
    function remove_liquidity(uint256 _amount, uint256[2] memory min_amounts) external;
    function remove_liquidity(uint256 _amount, uint256[3] memory min_amounts) external;


    /**
     * @notice Withdraw coins from the pool in an imbalanced amount
     * @param amounts: List of amounts of underlying coins to withdraw
     * @param max_burn_amount: Maximum amount of LP token to burn in the withdrawal
     */
    function remove_liquidity_imbalance(uint256[2] memory amounts, uint256 max_burn_amount) external;
    function remove_liquidity_imbalance(uint256[3] memory amounts, uint256 max_burn_amount) external;

    /**
     * @notice Withdraw a single coin from the pool
     * @param _token_amount: Amount of LP tokens to burn in the withdrawal
     * @param i: Index value of the coin to withdraw
     * @param min_amount: Minimum amount of coin to receive
     */
    function remove_liquidity_one_coin(
        uint256 _token_amount,
        uint256 i,
        uint256 min_amount
    ) external;
}
