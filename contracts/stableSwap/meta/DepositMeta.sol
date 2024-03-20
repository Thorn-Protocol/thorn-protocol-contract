// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../../interfaces/IMetaStableSwap.sol";
import "../../interfaces/IThreePoolStableSwap.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract DepositMeta{

    address constant ZERO_ADDRESS = address(0);
    address constant FEE_ASSET = address(0xdAC17F958D2ee523a2206206994597C13D831ec7); // Fill in the actual address
    uint256 constant FEE_DENOMINATOR = 10**10;
    uint256 constant FEE_IMPRECISION = 100 * 10**8; // % of the fee

    uint256 constant MAX_COIN = 10; // Define your value
    uint256 constant N_COINS =2 ; // Define your value
    uint256 constant BASE_N_COINS = 3; // Define your value
    uint256 constant N_ALL_COINS = N_COINS + BASE_N_COINS - 1;

    address public pool;
    address public token;
    address public base_pool;
    address[N_COINS] public coins;
    address[BASE_N_COINS] public base_coins;

    constructor(address _pool, address _token) {
        pool = _pool;
        token = _token;
        base_pool = IThreePoolStableSwap(_pool).base_pool();

        for (uint256 i = 0; i < N_COINS; i++) {
            address coin = IMetaStableSwap(_pool).coins(i);
            coins[i] = coin;
            require(IERC20(coin).approve(_pool, type(uint256).max));
        }

        for (uint256 i = 0; i < BASE_N_COINS; i++) {
            address coin = IThreePoolStableSwap(base_pool).coins(i);
            base_coins[i] = coin;
            require(IERC20(coin).approve(base_pool, type(uint256).max));
        }
    }



    function add_liquidity(uint256[N_ALL_COINS] memory _amounts, uint256 _min_mint_amount) external returns (uint256) {
        uint256[N_COINS] memory meta_amounts;
        uint256[BASE_N_COINS] memory base_amounts;
        bool deposit_base = false;

        // Transfer all coins in
        for (uint256 i = 0; i < N_ALL_COINS; i++) {
            uint256 amount = _amounts[i];
            if (amount == 0) {
                continue;
            }
            address coin;
            if (i < MAX_COIN) {
                coin = coins[i];
                meta_amounts[i] = amount;
            } else {
                uint256 x = i - MAX_COIN;
                coin = base_coins[x];
                base_amounts[x] = amount;
                deposit_base = true;
            }
            // safeTransferFrom which works for IERC20s which return bool or not
            require(IERC20(coin).transferFrom(msg.sender, address(this), amount), "Failed transfer");
            // Handle potential Tether fees
            if (coin == FEE_ASSET) {
                amount = IERC20(FEE_ASSET).balanceOf(address(this));
                if (i < MAX_COIN) {
                    meta_amounts[i] = amount;
                } else {
                    base_amounts[i - MAX_COIN] = amount;
                }
            }
        }

        // Deposit to the base pool
        if (deposit_base) {
            IThreePoolStableSwap(base_pool).add_liquidity(base_amounts, 0);
            meta_amounts[MAX_COIN] = IERC20(coins[MAX_COIN]).balanceOf(address(this));
        }

        // Deposit to the meta pool
        IMetaStableSwap(pool).add_liquidity(meta_amounts, _min_mint_amount);

        // Transfer meta token back
        address lp_token = token;
        uint256 lp_amount = IERC20(lp_token).balanceOf(address(this));
        require(IERC20(lp_token).transfer(msg.sender, lp_amount));

        return lp_amount;
    
    }

    function remove_liquidity(uint256 _amount, uint256[N_ALL_COINS] memory _min_amounts) external returns (uint256[N_ALL_COINS] memory) {
        address _token = token;
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount));

        uint256[N_COINS] memory min_amounts_meta;
        uint256[BASE_N_COINS] memory min_amounts_base;
        uint256[N_ALL_COINS] memory amounts;

        // Withdraw from meta
        for (uint256 i = 0; i < MAX_COIN; i++) {
            min_amounts_meta[i] = _min_amounts[i];
        }
        IMetaStableSwap(pool).remove_liquidity(_amount, min_amounts_meta);

        // Withdraw from base
        uint256 _base_amount = IERC20(coins[MAX_COIN]).balanceOf(address(this));
        for (uint256 i = 0; i < BASE_N_COINS; i++) {
            min_amounts_base[i] = _min_amounts[MAX_COIN + i];
        }
        IThreePoolStableSwap(base_pool).remove_liquidity(_base_amount, min_amounts_base);

        // Transfer all coins out
        for (uint256 i = 0; i < N_ALL_COINS; i++) {
            address coin;
            if (i < MAX_COIN) {
                coin = coins[i];
            } else {
                coin = base_coins[i - MAX_COIN];
            }
            amounts[i] = IERC20(coin).balanceOf(address(this));
            require(IERC20(coin).transfer(msg.sender, amounts[i]));
        }

        return amounts;
    }

    function remove_liquidity_one_coin(uint256 _token_amount, uint256 i, uint256 _min_amount) external returns (uint256) {
        require(IERC20(token).transferFrom(msg.sender, address(this), _token_amount));

        address coin;
        if (i < MAX_COIN) {
            coin = coins[i];
            IMetaStableSwap(pool).remove_liquidity_one_coin(_token_amount, i, _min_amount);
        } else {
            coin = base_coins[i - MAX_COIN];
            IMetaStableSwap(pool).remove_liquidity_one_coin(_token_amount, MAX_COIN, 0);
            uint256 _base_amount = IERC20(coins[MAX_COIN]).balanceOf(address(this));
            IThreePoolStableSwap(base_pool).remove_liquidity_one_coin(_base_amount, i - MAX_COIN, _min_amount);
        }

        uint256 coin_amount = IERC20(coin).balanceOf(address(this));
        require(IERC20(coin).transfer(msg.sender, coin_amount));

        return coin_amount;
    }

    function remove_liquidity_imbalance(uint256[N_ALL_COINS] memory _amounts, uint256 _max_burn_amount) external returns (uint256) {
        address meta_pool = pool;
        address[N_COINS] memory meta_coins = coins;
        address lp_token =token;

        uint256 fee = IThreePoolStableSwap(base_pool).fee() * BASE_N_COINS / (4 * (BASE_N_COINS - 1));
        fee += fee * FEE_IMPRECISION / FEE_DENOMINATOR;  // Overcharge to account for imprecision

        // Transfer the LP token in
        require(IERC20(lp_token).transferFrom(msg.sender, address(this), _max_burn_amount));

        bool withdraw_base = false;
        uint256[BASE_N_COINS] memory amounts_base;
        uint256[N_COINS] memory amounts_meta;
        uint256[N_COINS] memory leftover_amounts;

        // Prepare quantities
        for (uint256 i = 0; i < MAX_COIN; i++) {
            amounts_meta[i] = _amounts[i];
        }

        for (uint256 i = 0; i < BASE_N_COINS; i++) {
            uint256 amount = _amounts[MAX_COIN + i];
            if (amount != 0) {
                amounts_base[i] = amount;
                withdraw_base = true;
            }
        }

        if (withdraw_base) {
            amounts_meta[MAX_COIN] = IThreePoolStableSwap(base_pool).calc_token_amount(amounts_base, false);
            amounts_meta[MAX_COIN] += amounts_meta[MAX_COIN] * fee / FEE_DENOMINATOR + 1;
        }

        // Remove liquidity and deposit leftovers back
        IMetaStableSwap(meta_pool).remove_liquidity_imbalance(amounts_meta, _max_burn_amount);
        if (withdraw_base) {
            IThreePoolStableSwap(base_pool).remove_liquidity_imbalance(amounts_base, amounts_meta[MAX_COIN]);
            leftover_amounts[MAX_COIN] = IERC20(meta_coins[MAX_COIN]).balanceOf(address(this));
            if (leftover_amounts[MAX_COIN] > 0) {
                IMetaStableSwap(meta_pool).add_liquidity(leftover_amounts, 0);
            }
        }

        // Transfer all coins out
        for (uint256 i = 0; i < N_ALL_COINS; i++) {
            address coin;
            uint256 amount;
            if (i < MAX_COIN) {
                coin = meta_coins[i];
                amount = amounts_meta[i];
            } else {
                coin = base_coins[i - MAX_COIN];
                amount = amounts_base[i - MAX_COIN];
            }
            // "safeTransfer" which works for IERC20s which return bool or not
            if (amount > 0) {
                bytes memory data;
                (bool success, ) = coin.call(abi.encodeWithSelector(0xa9059cbb, msg.sender, amount, data));
                require(success, "failed transfer");
            }
        }

        // Transfer the leftover LP token out
        uint256 leftover = IERC20(lp_token).balanceOf(address(this));
        if (leftover > 0) {
            require(IERC20(lp_token).transfer(msg.sender, leftover));
        }

        return _max_burn_amount - leftover;
    }

    function calc_withdraw_one_coin(uint256 _token_amount, uint256 i) external view returns (uint256) {
        if (i < MAX_COIN) {
            return IMetaStableSwap(pool).calc_withdraw_one_coin(_token_amount, uint256(i));
        } else {
            uint256 base_tokens = IMetaStableSwap(pool).calc_withdraw_one_coin(_token_amount, MAX_COIN);
            return IThreePoolStableSwap(base_pool).calc_withdraw_one_coin(base_tokens, i - MAX_COIN);
        }
    }

    function calc_token_amount(uint256[N_ALL_COINS] memory _amounts, bool _is_deposit) external view returns (uint256) {
        uint256[N_COINS] memory meta_amounts;
        uint256[BASE_N_COINS] memory base_amounts;

        for (uint256 i = 0; i < MAX_COIN; i++) {
            meta_amounts[i] = _amounts[i];
        }

        for (uint256 i = 0; i < BASE_N_COINS; i++) {
            base_amounts[i] = _amounts[i + MAX_COIN];
        }

        uint256 base_tokens = IThreePoolStableSwap(base_pool).calc_token_amount(base_amounts, _is_deposit);
        meta_amounts[MAX_COIN] = base_tokens;

        return IMetaStableSwap(pool).calc_token_amount(meta_amounts, _is_deposit);
    }









}




