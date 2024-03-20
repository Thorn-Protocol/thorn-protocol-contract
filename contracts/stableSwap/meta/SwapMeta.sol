// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '../../interfaces/IThreePoolStableSwap.sol';
import '../../interfaces/IStableSwapLP.sol';

contract SwapMeta is ReentrancyGuard {
    using SafeMath for uint256;

    // Constants
    uint256 constant N_COINS = 2;
    uint256 constant MAX_COIN = N_COINS - 1;

    uint256 constant FEE_DENOMINATOR = 10**10;
    uint256 constant PRECISION = 10**18;
    uint256[N_COINS] PRECISION_MUL = [1, 1];
    uint256[N_COINS] RATES = [10**18, 10**18];

    uint256 constant BASE_N_COINS = 3;
    uint256 constant N_ALL_COINS = N_COINS + BASE_N_COINS - 1;
    uint256[BASE_N_COINS] BASE_PRECISION_MUL = [1, 10**12, 10**12];
    uint256[BASE_N_COINS] BASE_RATES = [10**18, 10**27, 10**27];

    address constant FEE_ASSET = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    uint256 constant MAX_ADMIN_FEE = 10 * 10**9;
    uint256 constant MAX_FEE = 5 * 10**9;
    uint256 constant MAX_A = 10**6;
    uint256 constant MAX_A_CHANGE = 10;

    uint256 constant ADMIN_ACTIONS_DELAY = 3 * 86400;
    uint256 constant MIN_RAMP_TIME = 86400;

    uint256 constant BASE_POOL_COINS = 3;
    uint256 constant BASE_CACHE_EXPIRES = 10 * 60;  // 10 min

    uint256 constant A_PRECISION = 100;

    uint256 constant KILL_DEADLINE_DT = 2 * 30 * 86400;

    uint256 constant MAX_UINT256 = type(uint256).max;

     // Events
    event TokenExchange(
        address indexed buyer,
        uint256 sold_id,
        uint256 tokens_sold,
        uint256 bought_id,
        uint256 tokens_bought
    );

    event TokenExchangeUnderlying(
        address indexed buyer,
        uint256 sold_id,
        uint256 tokens_sold,
        uint256 bought_id,
        uint256 tokens_bought
    );

    event AddLiquidity(
        address indexed provider,
        uint256[N_COINS] token_amounts,
        uint256[N_COINS] fees,
        uint256 invariant,
        uint256 token_supply
    );

    event RemoveLiquidity(
        address indexed provider,
        uint256[N_COINS] token_amounts,
        uint256[N_COINS] fees,
        uint256 token_supply
    );

    event RemoveLiquidityOne(
        address indexed provider,
        uint256 token_amount,
        uint256 coin_amount,
        uint256 token_supply
    );

    event RemoveLiquidityImbalance(
        address indexed provider,
        uint256[N_COINS] token_amounts,
        uint256[N_COINS] fees,
        uint256 invariant,
        uint256 token_supply
    );

    event CommitNewAdmin(uint256 deadline, address admin);
    event NewAdmin(address admin);
    event CommitNewFee(uint256 deadline, uint256 fee, uint256 admin_fee);
    event NewFee(uint256 fee, uint256 admin_fee);
    event RampA(uint256 old_A, uint256 new_A, uint256 initial_time, uint256 future_time);
    event StopRampA(uint256 A, uint256 t);

    // Variables
    address[N_COINS] public coins;
    uint256[N_COINS] public balances;
    uint256 public fee;
    uint256 public admin_fee;
    address public owner;
    IStableSwapLP public token;
    address public base_pool;
    uint256 public base_virtual_price;
    uint256 public base_cache_updated;
    address[BASE_N_COINS] public base_coins;
    uint256 public initial_A;
    uint256 public future_A;
    uint256 public initial_A_time;
    uint256 public future_A_time;
    uint256 public admin_actions_deadline;
    uint256 public transfer_ownership_deadline;
    uint256 public future_fee;
    uint256 public future_admin_fee;
    address public future_owner;
    bool public is_killed;
    uint256 public kill_deadline;

    constructor(
        address _owner,
        address[N_COINS] memory _coins,
        address _pool_token,
        address _base_pool,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee
    ) {
        for (uint256 i = 0; i < N_COINS; i++) {
            require(_coins[i] != address(0), "Invalid coin address");
        }
        coins = _coins;
        initial_A = _A * 100;
        future_A = _A * 100;
        fee = _fee;
        admin_fee = _admin_fee;
        owner = _owner;
        kill_deadline = block.timestamp + KILL_DEADLINE_DT;
        token = IStableSwapLP(_pool_token);

        base_pool = _base_pool;
        base_virtual_price = IThreePoolStableSwap(_base_pool).get_virtual_price();
        base_cache_updated = block.timestamp;
        for (uint256 i = 0; i < BASE_N_COINS; i++) {
            address _base_coin = IThreePoolStableSwap(_base_pool).coins(i);
            base_coins[i] = _base_coin;

            // approve underlying coins for infinite transfers
            (bool success, bytes memory data) = _base_coin.call(
                abi.encodeWithSignature("approve(address,uint256)", _base_pool, MAX_UINT256)
            );
            require(success && (data.length == 0 || abi.decode(data, (bool))), "Approval failed");
        }
    }

        function _get_A() internal view returns (uint256) {
        uint256 t1 = future_A_time;
        uint256 A1 = future_A;

        if (block.timestamp < t1) {
            uint256 A0 = initial_A;
            uint256 t0 = initial_A_time;

            if (A1 > A0) {
                return A0 + (A1 - A0) * (block.timestamp - t0) / (t1 - t0);
            } else {
                return A0 - (A0 - A1) * (block.timestamp - t0) / (t1 - t0);
            }
        } else {
            return A1;
        }
    }

    function A() external view returns (uint256) {
        return _get_A() / A_PRECISION;
    }

    function A_precise() external view returns (uint256) {
        return _get_A();
    }

    function _xp(uint256 vp_rate) internal view returns (uint256[N_COINS] memory) {
        uint256[N_COINS] memory result = RATES;
        result[MAX_COIN] = vp_rate;

        for (uint256 i = 0; i < N_COINS; i++) {
            result[i] = result[i] * balances[i] / PRECISION;
        }
        return result;
    }

    function _xp_mem(uint256 vp_rate, uint256[N_COINS] memory _balances) internal view returns (uint256[N_COINS] memory) { //đổi pure->view
        uint256[N_COINS] memory result = RATES;
        result[MAX_COIN] = vp_rate;

        for (uint256 i = 0; i < N_COINS; i++) {
            result[i] = result[i] * _balances[i] / PRECISION;
        }
        return result;
    }

    function _vp_rate() internal returns (uint256) { //bỏ view
        if (block.timestamp > base_cache_updated + BASE_CACHE_EXPIRES) {
            uint256 vprice = IThreePoolStableSwap(base_pool).get_virtual_price();
            base_virtual_price = vprice;
            base_cache_updated = block.timestamp;
            return vprice;
        } else {
            return base_virtual_price;
        }
    }

    function _vp_rate_ro() internal view returns (uint256) {
        if (block.timestamp > base_cache_updated + BASE_CACHE_EXPIRES) {
            return IThreePoolStableSwap(base_pool).get_virtual_price();
        } else {
            return base_virtual_price;
        }
    }

    function get_D(uint256[N_COINS] memory xp, uint256 amp) internal pure returns (uint256) {
        uint256 S = 0;
        uint256 Dprev = 0;

        for (uint256 i = 0; i < N_COINS; i++) {
            S += xp[i];
        }

        if (S == 0) {
            return 0;
        }

        uint256 D = S;
        uint256 Ann = amp * N_COINS;

        for (uint256 i = 0; i < 255; i++) {
            uint256 D_P = D;

            for (uint256 j = 0; j < N_COINS; j++) {
                D_P = D_P * D / (xp[j] * N_COINS);
            }

            Dprev = D;
            D = (Ann * S / A_PRECISION + D_P * N_COINS) * D / ((Ann - A_PRECISION) * D / A_PRECISION + (N_COINS + 1) * D_P);

            if (D > Dprev) {
                if (D - Dprev <= 1) {
                    break;
                }
            } else {
                if (Dprev - D <= 1) {
                    break;
                }
            }
        }
        return D;
    }

    function get_D_mem(uint256 vp_rate, uint256[N_COINS] memory _balances, uint256 amp) internal view returns (uint256) {
        uint256[N_COINS] memory xp = _xp_mem(vp_rate, _balances);
        return get_D(xp, amp);
    }

    function get_virtual_price() external view returns (uint256) {
        uint256 amp = _get_A();
        uint256 vp_rate = _vp_rate_ro();
        uint256[N_COINS] memory xp = _xp(vp_rate);
        uint256 D = get_D(xp, amp);
        uint256 token_supply = token.totalSupply();
        return D * PRECISION / token_supply;
    }

    function calc_token_amount(uint256[N_COINS] memory amounts, bool is_deposit) external view returns (uint256) {
        uint256 amp = _get_A();
        uint256 vp_rate = _vp_rate_ro();
        uint256[N_COINS] memory _balances = balances;
        uint256 D0 = get_D_mem(vp_rate, _balances, amp);

        for (uint256 i = 0; i < N_COINS; i++) {
            if (is_deposit) {
                _balances[i] += amounts[i];
            } else {
                _balances[i] -= amounts[i];
            }
        }

        uint256 D1 = get_D_mem(vp_rate, _balances, amp);
        uint256 token_amount = token.totalSupply();
        uint256 diff = 0;

        if (is_deposit) {
            diff = D1 - D0;
        } else {
            diff = D0 - D1;
        }

        return diff * token_amount / D0;
    }

        function add_liquidity(uint256[N_COINS] calldata amounts, uint256 min_mint_amount) external nonReentrant() returns (uint256) {
        assert(!is_killed); // dev: is killed

        uint256 _fee = fee * N_COINS / (4 * (N_COINS - 1));

        // Initial invariant
        uint256 D0 = 0;
        uint256[N_COINS] memory old_balances = balances;

        if (token.totalSupply() > 0) {
            D0 = get_D_mem(_vp_rate(), old_balances, _get_A());
        }

        uint256[N_COINS] memory new_balances = old_balances;

        for (uint256 i = 0; i < N_COINS; i++) {
            if (token.totalSupply() == 0) {
                assert(amounts[i] > 0); // dev: initial deposit requires all coins
            }
            // balances store amounts of c-tokens
            new_balances[i] = old_balances[i] + amounts[i];
        }

        // Invariant after change
        uint256 D1 = get_D_mem(_vp_rate(), new_balances, _get_A());
        assert(D1 > D0);

        // We need to recalculate the invariant accounting for fees
        // to calculate fair user's share
        uint256[N_COINS] memory fees;
        uint256 D2 = D1;

        if (token.totalSupply() > 0) {
            // Only account for fees if we are not the first to deposit
            for (uint256 i = 0; i < N_COINS; i++) {
                uint256 ideal_balance = D1 * old_balances[i] / D0;
                uint256 difference = 0;

                if (ideal_balance > new_balances[i]) {
                    difference = ideal_balance - new_balances[i];
                } else {
                    difference = new_balances[i] - ideal_balance;
                }

                fees[i] = _fee * difference / FEE_DENOMINATOR;
                balances[i] = new_balances[i] - (fees[i] * admin_fee / FEE_DENOMINATOR);
                new_balances[i] -= fees[i];
            }

            D2 = get_D_mem(_vp_rate(), new_balances, _get_A());
        } else {
            balances = new_balances;
        }

        // Calculate, how much pool tokens to mint
        uint256 mint_amount = 0;

        if (token.totalSupply() == 0) {
            mint_amount = D1; // Take the dust if there was any
        } else {
            mint_amount = token.totalSupply() * (D2 - D0) / D0;
        }

        require(mint_amount >= min_mint_amount, "Slippage screwed you");

        // Take coins from the sender
        for (uint256 i = 0; i < N_COINS; i++) {
            if (amounts[i] > 0) {
                require(ERC20(coins[i]).transferFrom(msg.sender, address(this), amounts[i]), "Failed transfer"); // dev: failed transfer
            }
        }

        // Mint pool tokens
        token.mint(msg.sender, mint_amount);

        emit AddLiquidity(msg.sender, amounts, fees, D1, token.totalSupply() + mint_amount);

        return mint_amount;
    }

    function get_y(uint256 i, uint256 j, uint256 x, uint256[N_COINS] memory xp_) internal view returns (uint256) {
        require(i != j); // dev: same coin
        require(j >= 0); // dev: j below zero
        require(j < N_COINS); // dev: j above N_COINS

        // should be unreachable, but good for safety
        require(i >= 0);
        require(i < N_COINS);

        uint256 amp = _get_A();
        uint256 D = get_D(xp_, amp);
        uint256 S_ = 0;
        uint256 _x = 0;
        uint256 y_prev = 0;
        uint256 c = D;
        uint256 Ann = amp * N_COINS;

        for (uint256 _i = 0; _i < N_COINS; _i++) {
            if (_i == uint256(i)) {
                _x = x;
            } else if (_i != uint256(j)) {
                _x = xp_[_i];
            } else {
                continue;
            }
            S_ += _x;
            c = c * D / (_x * N_COINS);
        }

        c = c * D * A_PRECISION / (Ann * N_COINS);
        uint256 b = S_ + D * A_PRECISION / Ann;
        uint256 y = D;

        for (uint256 _i = 0; _i < 255; _i++) {
            y_prev = y;
            y = (y * y + c) / (2 * y + b - D);

            // Equality with the precision of 1
            if (y > y_prev) {
                if (y - y_prev <= 1) {
                    break;
                }
            } else {
                if (y_prev - y <= 1) {
                    break;
                }
            }
        }
        return y;
    }

    function get_dy(uint256 i, uint256 j, uint256 dx) external view returns (uint256) {
        // dx and dy in c-units
        uint256[N_COINS] memory rates = RATES;
        rates[MAX_COIN] = _vp_rate_ro();
        uint256[N_COINS] memory xp = _xp(rates[MAX_COIN]);
        uint256 x = xp[uint256(i)] + (dx * rates[uint256(i)] / PRECISION);
        uint256 y = get_y(i, j, x, xp);
        uint256 dy = xp[uint256(j)] - y - 1;
        uint256 _fee = fee * dy / FEE_DENOMINATOR;
        return (dy - _fee) * PRECISION / rates[uint256(j)];
    }

    function get_dy_underlying(uint256 i, uint256 j, uint256 dx) external view returns (uint256) {
        // dx and dy in underlying units
        uint256 vp_rate = _vp_rate_ro();
        uint256[N_COINS] memory xp = _xp(vp_rate);
        uint256[N_COINS] memory precisions = PRECISION_MUL;
        address _base_pool = base_pool;
        uint256 base_i = i - MAX_COIN;
        uint256 base_j = j - MAX_COIN;
        uint256 meta_i = MAX_COIN;
        uint256 meta_j = MAX_COIN;

        if (base_i < 0) {
            meta_i = i;
        }
        if (base_j < 0) {
            meta_j = j;
        }

        uint256 x = 0;

        if (base_i < 0) {
            x = xp[uint256(i)] + dx * precisions[uint256(i)];
        } else {
            if (base_j < 0) {
                uint256[BASE_N_COINS] memory base_inputs; 
                base_inputs[uint256(base_i)] = dx;
                x = IThreePoolStableSwap(_base_pool).calc_token_amount(base_inputs, true) * vp_rate / PRECISION;
                x -= x * IThreePoolStableSwap(_base_pool).fee() / (2 * FEE_DENOMINATOR);
                x += xp[MAX_COIN];
            } else {
                return IThreePoolStableSwap(_base_pool).get_dy(base_i, base_j, dx);
            }
        }

        uint256 y = get_y(meta_i, meta_j, x, xp);
        uint256 dy = xp[uint256(meta_j)] - y - 1;
        dy = (dy - fee * dy / FEE_DENOMINATOR);

        if (base_j < 0) {
            dy /= precisions[uint256(meta_j)];
        } else {
            dy = IThreePoolStableSwap(_base_pool).calc_withdraw_one_coin(dy * PRECISION / vp_rate, base_j);
        }

        return dy;
    }

        function exchange(uint256 i, uint256 j, uint256 dx, uint256 min_dy) external nonReentrant() returns (uint256) {
        assert(!is_killed); // dev: is killed
        uint256[N_COINS] memory rates = RATES;
        rates[MAX_COIN] = _vp_rate();

        uint256[N_COINS] memory old_balances = balances;
        uint256[N_COINS] memory xp = _xp_mem(rates[MAX_COIN], old_balances);

        uint256 x = xp[uint256(i)] + dx * rates[uint256(i)] / PRECISION;
        uint256 y = get_y(i, j, x, xp);

        uint256 dy = xp[uint256(j)] - y - 1; // -1 just in case there were some rounding errors
        uint256 dy_fee = dy * fee / FEE_DENOMINATOR;

        // Convert all to real units
        dy = (dy - dy_fee) * PRECISION / rates[uint256(j)];
        require (dy >= min_dy, "Too few coins in result");

        uint256 dy_admin_fee = dy_fee * admin_fee / FEE_DENOMINATOR;
        dy_admin_fee = dy_admin_fee * PRECISION / rates[uint256(j)];

        // Change balances exactly in same way as we change actual ERC20 coin amounts
        balances[uint256(i)] = old_balances[uint256(i)] + dx;
        // When rounding errors happen, we undercharge admin fee in favor of LP
        balances[uint256(j)] = old_balances[uint256(j)] - dy - dy_admin_fee;

        require(ERC20(coins[uint256(i)]).transferFrom(msg.sender, address(this), dx), "Failed transfer");
        require(ERC20(coins[uint256(j)]).transfer(msg.sender, dy), "Failed transfer");

        emit TokenExchange(msg.sender, i, dx, j, dy);

        return dy;
    }

    // function exchange_underlying(uint256 i, uint256 j, uint256 dx, uint256 min_dy) external nonReentrant() returns (uint256) {
    //     assert(!is_killed); // dev: is killed
    //     uint256[N_COINS] memory rates = RATES;
    //     rates[MAX_COIN] = _vp_rate();
    //     address _base_pool = base_pool;

    //     // Use base_i or base_j if they are >= 0
    //     uint256 base_i = i - MAX_COIN;
    //     uint256 base_j = j - MAX_COIN;
    //     uint256 meta_i = MAX_COIN;
    //     uint256 meta_j = MAX_COIN;
    //     if (base_i < 0) {
    //         meta_i = i;
    //     }
    //     if (base_j < 0) {
    //         meta_j = j;
    //     }
    //     uint256 dy = 0;

    //     // Addresses for input and output coins
    //     address input_coin = address(0);
    //     if (base_i < 0) {
    //         input_coin = coins[uint256(i)];
    //     } else {
    //         input_coin = base_coins[uint256(base_i)];
    //     }
    //     address output_coin = address(0);
    //     if (base_j < 0) {
    //         output_coin = coins[uint256(j)];
    //     } else {
    //         output_coin = base_coins[uint256(base_j)];
    //     }

    //     // Handle potential Tether fees
    //     uint256 dx_w_fee = dx;
    //     if (input_coin == FEE_ASSET) {
    //         dx_w_fee = ERC20(FEE_ASSET).balanceOf(address(this));
    //     }
    //     // "safeTransferFrom" which works for ERC20s which return bool or not
    //     (bool success, bytes memory data) = input_coin.call(
    //         abi.encodeWithSelector(
    //             bytes4(keccak256("transferFrom(address,address,uint256)")),
    //             msg.sender,
    //             address(this),
    //             dx
    //         )
    //     );
    //     require(success && (data.length == 0 || abi.decode(data, (bool))), "Failed transfer");
    //     // end "safeTransferFrom"
    //     // Handle potential Tether fees
    //     if (input_coin == FEE_ASSET) {
    //         dx_w_fee = ERC20(FEE_ASSET).balanceOf(address(this)) - dx_w_fee;
    //     }

    //     if (base_i < 0 || base_j < 0) {
    //         uint256[N_COINS] memory old_balances = balances;
    //         uint256[N_COINS] memory xp = _xp_mem(rates[MAX_COIN], old_balances);

    //         uint256 x = 0;
    //         if (base_i < 0) {
    //             x = xp[uint256(i)] + dx_w_fee * rates[uint256(i)] / PRECISION;
    //         } else {
    //             // i is from BasePool
    //             // At first, get the amount of pool tokens
    //             uint256[BASE_N_COINS] memory base_inputs; 
    //             base_inputs[uint256(base_i)] = dx_w_fee;
    //             address coin_i = coins[MAX_COIN];
    //             // Deposit and measure delta
    //             x = ERC20(coin_i).balanceOf(address(this));
    //             Curve(_base_pool).add_liquidity(base_inputs, 0);
    //             // Need to convert pool token to "virtual" units using rates
    //             // dx is also different now
    //             dx_w_fee = ERC20(coin_i).balanceOf(address(this)) - x;
    //             x = dx_w_fee * rates[MAX_COIN] / PRECISION;
    //             // Adding number of pool tokens
    //             x += xp[MAX_COIN];
    //         }

    //         uint256 y = get_y(meta_i, meta_j, x, xp);

    //         // Either a real coin or token
    //         dy = xp[uint256(meta_j)] - y - 1; // -1 just in case there were some rounding errors
    //         uint256 dy_fee = dy * fee / FEE_DENOMINATOR;

    //         // Convert all to real units
    //         // Works for both pool coins and real coins
    //         dy = (dy - dy_fee) * PRECISION / rates[uint256(meta_j)];

    //         uint256 dy_admin_fee = dy_fee * admin_fee / FEE_DENOMINATOR;
    //         dy_admin_fee = dy_admin_fee * PRECISION / rates[uint256(meta_j)];

    //         // Change balances exactly in same way as we change actual ERC20 coin amounts
    //         balances[uint256(meta_i)] = old_balances[uint256(meta_i)] + dx_w_fee;
    //         // When rounding errors happen, we undercharge admin fee in favor of LP
    //         balances[uint256(meta_j)] = old_balances[uint256(meta_j)] - dy - dy_admin_fee;

    //         // Withdraw from the base pool if needed
    //         if (base_j >= 0) {
    //             uint256 out_amount = ERC20(output_coin).balanceOf(address(this));
    //             Curve(_base_pool).remove_liquidity_one_coin(dy, base_j, 0);
    //             dy = ERC20(output_coin).balanceOf(address(this)) - out_amount;
    //         }

    //         require(dy >= min_dy, "Too few coins in result");
    //     } else {
    //         // If both are from the base pool
    //         dy = ERC20(output_coin).balanceOf(address(this));
    //         Curve(_base_pool).exchange(base_i, base_j, dx_w_fee, min_dy);
    //         dy = ERC20(output_coin).balanceOf(address(this)) - dy;
    //     }

    //     // "safeTransfer" which works for ERC20s which return bool or not
    //     (success, data) = output_coin.call(
    //         abi.encodeWithSelector(
    //             bytes4(keccak256("transfer(address,uint256)")),
    //             msg.sender,
    //             dy
    //         )
    //     );
    //     require(success && (data.length == 0 || abi.decode(data, (bool))), "Failed transfer");

    //     emit TokenExchangeUnderlying(msg.sender, i, dx, j, dy);

    //     return dy;
    // }

    // 
    
    function exchange_underlying(uint256 i, uint256 j, uint256 dx, uint256 min_dy) external nonReentrant() returns (uint256) {
    assert(!is_killed); // dev: is killed
    uint256[N_COINS] memory rates = RATES;
    rates[MAX_COIN] = _vp_rate();

    uint256 dy = 0;

    // Addresses for input and output coins
    address input_coin = (i - MAX_COIN < 0) ? coins[uint256(i)] : base_coins[uint256(i - MAX_COIN)];
    address output_coin = (j - MAX_COIN < 0) ? coins[uint256(j)] : base_coins[uint256(j - MAX_COIN)];

    // Handle potential Tether fees
    uint256 dx_w_fee = dx;
    if (input_coin == FEE_ASSET) {
        dx_w_fee = ERC20(FEE_ASSET).balanceOf(address(this));
    }
    // "safeTransferFrom" which works for ERC20s which return bool or not
    (bool success, bytes memory data) = input_coin.call(
        abi.encodeWithSelector(
            bytes4(keccak256("transferFrom(address,address,uint256)")),
            msg.sender,
            address(this),
            dx
        )
    );
    require(success && (data.length == 0 || abi.decode(data, (bool))), "Failed transfer");
    // end "safeTransferFrom"
    // Handle potential Tether fees
    if (input_coin == FEE_ASSET) {
        dx_w_fee = ERC20(FEE_ASSET).balanceOf(address(this)) - dx_w_fee;
    }

    if (i - MAX_COIN < 0 || j - MAX_COIN < 0) {
        dy = exchange_underlying_calculation(i - MAX_COIN, (i - MAX_COIN < 0) ? i : MAX_COIN, (j - MAX_COIN < 0) ? j : MAX_COIN, dx_w_fee);
        // Withdraw from the base pool if needed
        if (j - MAX_COIN >= 0) {
            IThreePoolStableSwap(base_pool).remove_liquidity_one_coin(dy, j - MAX_COIN, 0);
            dy = ERC20(output_coin).balanceOf(address(this)) - ERC20(output_coin).balanceOf(address(this));
        }

        require(dy >= min_dy, "Too few coins in result");
    } else {
        dy = ERC20(output_coin).balanceOf(address(this));
        IThreePoolStableSwap(base_pool).exchange(i - MAX_COIN, j - MAX_COIN, dx_w_fee, min_dy);
        dy = ERC20(output_coin).balanceOf(address(this)) - dy;
    }

    // "safeTransfer" which works for ERC20s which return bool or not
    (success, data) = output_coin.call(
        abi.encodeWithSelector(
            bytes4(keccak256("transfer(address,uint256)")),
            msg.sender,
            dy
        )
    );
    require(success && (data.length == 0 || abi.decode(data, (bool))), "Failed transfer");

    emit TokenExchangeUnderlying(msg.sender, i, dx, j, dy);

    return dy;
}

    function exchange_underlying_calculation(uint256 base_i, uint256 meta_i, uint256 meta_j, uint256 dx_w_fee) private returns (uint256) {
        uint256[N_COINS] memory rates = RATES;
        uint256[N_COINS] memory old_balances = balances;
        uint256[N_COINS] memory xp = _xp_mem(rates[MAX_COIN], old_balances);

        uint256 x = 0;
        if (base_i < 0) {
            x = xp[uint256(meta_i)] + dx_w_fee * rates[uint256(meta_i)] / PRECISION;
        } else {
            // i is from BasePool
            // At first, get the amount of pool tokens
            uint256[BASE_N_COINS] memory base_inputs; 
            base_inputs[uint256(base_i)] = dx_w_fee;
            address coin_i = coins[MAX_COIN];
            // Deposit and measure delta
            x = ERC20(coin_i).balanceOf(address(this));
            IThreePoolStableSwap(base_pool).add_liquidity(base_inputs, 0);
            // Need to convert pool token to "virtual" units using rates
            // dx is also different now
            dx_w_fee = ERC20(coin_i).balanceOf(address(this)) - x;
            x = dx_w_fee * rates[MAX_COIN] / PRECISION;
            // Adding number of pool tokens
            x += xp[MAX_COIN];
        }

        uint256 y = get_y(meta_i, meta_j, x, xp);

        // Either a real coin or token
        uint256 dy = xp[uint256(meta_j)] - y - 1; // -1 just in case there were some rounding errors
        uint256 dy_fee = dy * fee / FEE_DENOMINATOR;

        // Convert all to real units
        // Works for both pool coins and real coins
        dy = (dy - dy_fee) * PRECISION / rates[uint256(meta_j)];

        uint256 dy_admin_fee = dy_fee * admin_fee / FEE_DENOMINATOR;
        dy_admin_fee = dy_admin_fee * PRECISION / rates[uint256(meta_j)];

        // Change balances exactly in same way as we change actual ERC20 coin amounts
        balances[uint256(meta_i)] = old_balances[uint256(meta_i)] + dx_w_fee;
        // When rounding errors happen, we undercharge admin fee in favor of LP
        balances[uint256(meta_j)] = old_balances[uint256(meta_j)] - dy - dy_admin_fee;

        return dy;
    }


        function remove_liquidity(uint256 _amount, uint256[N_COINS] memory min_amounts) external nonReentrant() returns (uint256[N_COINS] memory) {
        uint256 total_supply = token.totalSupply();
        uint256[N_COINS] memory amounts;
        uint256[N_COINS] memory fees; // Fees are unused but we've got them historically in event

        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 value = balances[i] * _amount / total_supply;
            require(value >= min_amounts[i], "Too few coins in result");
            balances[i] -= value;
            amounts[i] = value;
            require(ERC20(coins[i]).transfer(msg.sender, value), "Failed transfer");
        }

        token.burnFrom(msg.sender, _amount); // dev: insufficient funds

        emit RemoveLiquidity(msg.sender, amounts, fees, total_supply - _amount);

        return amounts;
    }

    function remove_liquidity_imbalance(uint256[N_COINS] memory amounts, uint256 max_burn_amount) external nonReentrant() returns (uint256) {
        assert(!is_killed); // dev: is killed

        // uint256 amp = _get_A();
        // uint256 vp_rate = _vp_rate();

        // uint256 token_supply = token.totalSupply();
        require(token.totalSupply() != 0, "zero total supply"); // dev: zero total supply
        uint256 _fee = fee * N_COINS / (4 * (N_COINS - 1));
        // uint256 _admin_fee = admin_fee;

        uint256[N_COINS] memory old_balances = balances;
        uint256[N_COINS] memory new_balances = old_balances;
        uint256 D0 = get_D_mem( _vp_rate(), old_balances, _get_A());
        for (uint256 i = 0; i < N_COINS; i++) {
            new_balances[i] -= amounts[i];
        }
        uint256 D1 = get_D_mem( _vp_rate(), new_balances, _get_A());

        uint256[N_COINS] memory fees;
        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 ideal_balance = D1 * old_balances[i] / D0;
            uint256 difference = 0;
            if (ideal_balance > new_balances[i]) {
                difference = ideal_balance - new_balances[i];
            } else {
                difference = new_balances[i] - ideal_balance;
            }
            fees[i] = _fee * difference / FEE_DENOMINATOR;
            balances[i] = new_balances[i] - (fees[i] * admin_fee / FEE_DENOMINATOR);
            new_balances[i] -= fees[i];
        }
        uint256 D2 = get_D_mem( _vp_rate(), new_balances, _get_A());

        uint256 token_amount = (D0 - D2) * token.totalSupply() / D0;
        require(token_amount != 0, "zero tokens burned"); // dev: zero tokens burned
        token_amount += 1; // In case of rounding errors - make it unfavorable for the "attacker"
        require(token_amount <= max_burn_amount, "Slippage screwed you");

        token.burnFrom(msg.sender, token_amount); // dev: insufficient funds
        for (uint256 i = 0; i < N_COINS; i++) {
            if (amounts[i] != 0) {
                require(ERC20(coins[i]).transfer(msg.sender, amounts[i]), "Failed transfer");
            }
        }

        emit RemoveLiquidityImbalance(msg.sender, amounts, fees, D1, token.totalSupply() - token_amount);

        return token_amount;
    }

    function get_y_D(uint256 A_, uint256 i, uint256[N_COINS] memory xp, uint256 D) internal pure returns (uint256) { //them pure
        // Calculate x[i] if one reduces D from being calculated for xp to D

        // Done by solving quadratic equation iteratively.
        // x_1**2 + x1 * (sum' - (A*n**n - 1) * D / (A * n**n)) = D ** (n + 1) / (n ** (2 * n) * prod' * A)
        // x_1**2 + b*x_1 = c
        // x_1 = (x_1**2 + c) / (2*x_1 + b)
        assert(i >= 0); // dev: i below zero
        assert(uint256(i) < N_COINS); // dev: i above N_COINS

        uint256 S_ = 0;
        uint256 _x = 0;
        uint256 y_prev = 0;

        uint256 c = D;
        uint256 Ann = A_ * N_COINS;

        for (uint256 _i = 0; _i < N_COINS; _i++) {
            if (_i != uint256(i)) {
                _x = xp[_i];
            } else {
                continue;
            }
            S_ += _x;
            c = c * D / (_x * N_COINS);
        }
        c = c * D * A_PRECISION / (Ann * N_COINS);
        uint256 b = S_ + D * A_PRECISION / Ann;
        uint256 y = D;
        for (uint256 _i = 0; _i < 255; _i++) {
            y_prev = y;
            y = (y * y + c) / (2 * y + b - D);
            // Equality with the precision of 1
            if (y > y_prev) {
                if (y - y_prev <= 1) {
                    break;
                }
            } else {
                if (y_prev - y <= 1) {
                    break;
                }
            }
        }
        return y;
    }

    function _calc_withdraw_one_coin(uint256 _token_amount, uint256 i, uint256 vp_rate) internal view returns (uint256, uint256, uint256) {
        // First, need to calculate
        // * Get current D
        // * Solve Eqn against y_i for D - _token_amount
        // uint256 amp = _get_A();
        uint256[N_COINS] memory xp = _xp(vp_rate);
        uint256 D0 = get_D(xp, _get_A());

        // uint256 total_supply = token.totalSupply();
        uint256 D1 = D0 - _token_amount * D0 / token.totalSupply();
        uint256 new_y = get_y_D(_get_A(), i, xp, D1);

        // uint256 _fee = fee * N_COINS / (4 * (N_COINS - 1));
        uint256[N_COINS] memory rates = RATES;
        rates[MAX_COIN] = vp_rate;

        uint256[N_COINS] memory xp_reduced = xp;
        uint256 dy_0 = (xp[uint256(i)] - new_y) * PRECISION / rates[uint256(i)]; // w/o fees

        for (uint256 j = 0; j < N_COINS; j++) {
            uint256 dx_expected = 0;
            if (j == uint256(i)) {
                dx_expected = xp[j] * D1 / D0 - new_y;
            } else {
                dx_expected = xp[j] - xp[j] * D1 / D0;
            }
            xp_reduced[j] -= fee * N_COINS / (4 * (N_COINS - 1)) * dx_expected / FEE_DENOMINATOR;
        }

        uint256 dy = xp_reduced[uint256(i)] - get_y_D(_get_A(), i, xp_reduced, D1);
        dy = (dy - 1) * PRECISION / rates[uint256(i)]; // Withdraw less to account for rounding errors

        return (dy, dy_0 - dy, token.totalSupply());
    }

    function calc_withdraw_one_coin(uint256 _token_amount, uint256 i) external view returns (uint256) {
        uint256 vp_rate = _vp_rate_ro();
        (uint256 result, , ) = _calc_withdraw_one_coin(_token_amount, i, vp_rate);
        return result;
    }

    function remove_liquidity_one_coin(uint256 _token_amount, uint256 i, uint256 _min_amount) external nonReentrant() returns (uint256) {
        assert(!is_killed); // dev: is killed

        uint256 vp_rate = _vp_rate();
        uint256 dy = 0;
        uint256 dy_fee = 0;
        uint256 total_supply = 0;
        (dy, dy_fee, total_supply) = _calc_withdraw_one_coin(_token_amount, i, vp_rate);
        require(dy >= _min_amount, "Not enough coins removed");

        balances[uint256(i)] -= (dy + dy_fee * admin_fee / FEE_DENOMINATOR);
        token.burnFrom(msg.sender, _token_amount); // dev: insufficient funds
        require(ERC20(coins[uint256(i)]).transfer(msg.sender, dy), "Failed transfer");

        emit RemoveLiquidityOne(msg.sender, _token_amount, dy, total_supply - _token_amount);

        return dy;
    }

    function ramp_A(uint256 _future_A, uint256 _future_time) external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        require(block.timestamp >= initial_A_time + MIN_RAMP_TIME);
        require(_future_time >= block.timestamp + MIN_RAMP_TIME); // dev: insufficient time

        uint256 _initial_A = _get_A();
        uint256 _future_A_p = _future_A * A_PRECISION;

        require(_future_A > 0 && _future_A < MAX_A);
        if (_future_A_p < _initial_A) {
            require(_future_A_p * MAX_A_CHANGE >= _initial_A);
        } else {
            require(_future_A_p <= _initial_A * MAX_A_CHANGE);
        }

        initial_A = _initial_A;
        future_A = _future_A_p;
        initial_A_time = block.timestamp;
        future_A_time = _future_time;

        emit RampA(_initial_A, _future_A_p, block.timestamp, _future_time);
    }

    function stop_ramp_A() external {
        require(msg.sender == owner, "only owner"); // dev: only owner

        uint256 current_A = _get_A();
        initial_A = current_A;
        future_A = current_A;
        initial_A_time = block.timestamp;
        future_A_time = block.timestamp;

        emit StopRampA(current_A, block.timestamp);
    }

    function commit_new_fee(uint256 new_fee, uint256 new_admin_fee) external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        require(admin_actions_deadline == 0); // dev: active action
        require(new_fee <= MAX_FEE); // dev: fee exceeds maximum
        require(new_admin_fee <= MAX_ADMIN_FEE); // dev: admin fee exceeds maximum

        uint256 _deadline = block.timestamp + ADMIN_ACTIONS_DELAY;
        admin_actions_deadline = _deadline;
        future_fee = new_fee;
        future_admin_fee = new_admin_fee;

        emit CommitNewFee(_deadline, new_fee, new_admin_fee);
    }

    function apply_new_fee() external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        require(block.timestamp >= admin_actions_deadline); // dev: insufficient time
        require(admin_actions_deadline != 0); // dev: no active action

        admin_actions_deadline = 0;
        uint256 _fee = future_fee;
        uint256 _admin_fee = future_admin_fee;
        fee = _fee;
        admin_fee = _admin_fee;

        emit NewFee(_fee, _admin_fee);
    }

    function revert_new_parameters() external {
        require(msg.sender == owner, "only owner"); // dev: only owner

        admin_actions_deadline = 0;
    }

    function commit_transfer_ownership(address _owner) external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        require(transfer_ownership_deadline == 0); // dev: active transfer

        uint256 _deadline = block.timestamp + ADMIN_ACTIONS_DELAY;
        transfer_ownership_deadline = _deadline;
        future_owner = _owner;

        emit CommitNewAdmin(_deadline, _owner);
    }

    function apply_transfer_ownership() external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        require(block.timestamp >= transfer_ownership_deadline); // dev: insufficient time
        require(transfer_ownership_deadline != 0); // dev: no active transfer

        transfer_ownership_deadline = 0;
        address _owner = future_owner;
        owner = _owner;

        emit NewAdmin(_owner);
    }

    function revert_transfer_ownership() external {
        require(msg.sender == owner, "only owner"); // dev: only owner

        transfer_ownership_deadline = 0;
    }

    function admin_balances(uint256 i) external view returns (uint256) {
        return ERC20(coins[i]).balanceOf(address(this)) - balances[i];
    }

    function withdraw_admin_fees() external {
        require(msg.sender == owner, "only owner"); // dev: only owner

        for (uint256 i = 0; i < N_COINS; i++) {
            address c = coins[i];
            uint256 value = ERC20(c).balanceOf(address(this)) - balances[i];
            if (value > 0) {
                require(ERC20(c).transfer(msg.sender, value), "Failed transfer");
            }
        }
    }

    function donate_admin_fees() external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        for (uint256 i = 0; i < N_COINS; i++) {
            balances[i] = ERC20(coins[i]).balanceOf(address(this));
        }
    }

    function kill_me() external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        require(kill_deadline > block.timestamp); // dev: deadline has passed
        is_killed = true;
    }

    function unkill_me() external {
        require(msg.sender == owner, "only owner"); // dev: only owner
        is_killed = false;
    }
}










