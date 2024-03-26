// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/ILendingPool.sol";
import "../../interfaces/IStableSwapLP.sol";

contract LendingTravaPool is ReentrancyGuard,Ownable {


    using SafeERC20 for IERC20;

    // These constants must be set prior to compiling
    uint8 constant N_COINS = 2;
    uint256[N_COINS] PRECISION_MUL = [1, 1000000000000];

    // fixed constants
    uint256 constant FEE_DENOMINATOR = 10 ** 10;
    uint256 constant PRECISION = 10 ** 18;  // The precision to convert to

    uint256 constant MAX_ADMIN_FEE = 10 * 10 ** 9;
    uint256 constant MAX_FEE = 5 * 10 ** 9;

    uint256 constant MAX_A = 10 ** 6;
    uint256 constant MAX_A_CHANGE = 10;
    uint256 constant A_PRECISION = 100;

    uint256 constant ADMIN_ACTIONS_DELAY = 3 * 86400;
    uint256 constant MIN_RAMP_TIME = 86400;

    address[N_COINS] public coins;
    address[N_COINS] public underlying_coins;
    uint256[N_COINS] public admin_balances;

    uint256 public fee;  // fee * 1e10
    uint256 public offpeg_fee_multiplier;  // * 1e10
    uint256 public admin_fee;  // admin_fee * 1e10

    // address public owner;
    address public lp_token;

    address public trava_lending_pool;
    uint256 public trava_referral;

    uint256 public initial_A;
    uint256 public future_A;
    uint256 public initial_A_time;
    uint256 public future_A_time;

    uint256 public admin_actions_deadline;
    // uint256 public transfer_ownership_deadline;
    uint256 public future_fee;
    uint256 public future_admin_fee;
    uint256 public future_offpeg_fee_multiplier;  // * 1e10
    // address public future_owner;

    bool public is_killed;
    uint256 public kill_deadline;
    uint256 constant KILL_DEADLINE_DT = 2 * 30 * 86400;

    address public immutable STABLESWAP_FACTORY;
    bool public isInitialized;
    address constant ROSE_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    bool support_ROSE;
    uint256 public rose_gas = 4029;
    uint256 public constant MIN_ROSE_gas = 2300;
    uint256 public constant MAX_ROSE_gas = 23000;

    // Events
    event TokenExchange(
        address buyer,
        uint256 sold_id,
        uint256 tokens_sold,
        uint256 bought_id,
        uint256 tokens_bought
    );

    event TokenExchangeUnderlying(
        address buyer,
        uint256 sold_id,
        uint256 tokens_sold,
        uint256 bought_id,
        uint256 tokens_bought
    );

    event AddLiquidity(
        address provider,
        uint256[N_COINS] token_amounts,
        uint256[N_COINS] fees,
        uint256 invariant,
        uint256 token_supply
    );

    event RemoveLiquidity(
        address provider,
        uint256[N_COINS] token_amounts,
        uint256[N_COINS] fees,
        uint256 token_supply
    );

    event RemoveLiquidityOne(
        address provider,
        uint256 token_amount,
        uint256 coin_amount
    );

    event RemoveLiquidityImbalance(
        address provider,
        uint256[N_COINS] token_amounts,
        uint256[N_COINS] fees,
        uint256 invariant,
        uint256 token_supply
    );

    event CommitNewAdmin(
        uint256 deadline,
        address admin
    );

    event NewAdmin(
        address admin
    );

    event CommitNewFee(
        uint256 deadline,
        uint256 fee,
        uint256 admin_fee,
        uint256 offpeg_fee_multiplier
    );

    event NewFee(
        uint256 fee,
        uint256 admin_fee,
        uint256 offpeg_fee_multiplier
    );

    event RampA(
        uint256 old_A,
        uint256 new_A,
        uint256 initial_time,
        uint256 future_time
    );

    event StopRampA(
        uint256 A,
        uint256 t
    );

    event SetROSEGas(uint256 rose_gas);

    constructor() {
        STABLESWAP_FACTORY = msg.sender;
    }

    function initialize(
        address[N_COINS] memory _coins,
        address[N_COINS] memory _underlying_coins,
        address _pool_token,
        address _trava_lending_pool,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee,
        uint256 _offpeg_fee_multiplier,
        address _owner
    )  external {

        require(!isInitialized, "Operations: Already initialized");
        require(msg.sender == STABLESWAP_FACTORY, "Operations: Not factory");
        require(_A <= MAX_A, "_A exceeds maximum");
        require(_fee <= MAX_FEE, "_fee exceeds maximum");
        require(_admin_fee <= MAX_ADMIN_FEE, "_admin_fee exceeds maximum");
        isInitialized = true;
        for (uint8 i = 0; i < N_COINS; i++) {
            require(_coins[i] != address(0), "Coin address cannot be zero");
            require(_underlying_coins[i] != address(0), "Underlying coin address cannot be zero");
        }

        coins = _coins;
        underlying_coins = _underlying_coins;
        initial_A = _A * A_PRECISION;
        future_A = _A * A_PRECISION;
        fee = _fee;
        admin_fee = _admin_fee;
        offpeg_fee_multiplier = _offpeg_fee_multiplier;
        kill_deadline = block.timestamp + KILL_DEADLINE_DT;
        lp_token = _pool_token;
        trava_lending_pool = _trava_lending_pool;

        // approve transfer of underlying coin to trava lending pool
        for (uint8 i = 0; i < N_COINS; i++) {
            require(_approve(underlying_coins[i], _trava_lending_pool, type(uint256).max), "Approval failed");
        }
         transferOwnership(_owner);
    }

    function _approve(address _token, address _spender, uint256 _amount) internal returns (bool) {
        bool success;
        bytes memory data;

        // solhint-disable-next-line avoid-low-level-calls
        (success, data) = _token.call(abi.encodeWithSelector(ERC20(_token).approve.selector, _spender, _amount));
        return (success && (data.length == 0 || abi.decode(data, (bool))));
    }

    function _get_A() internal view returns (uint256) {
        uint256 t1 = future_A_time;
        uint256 A1 = future_A;

        if (block.timestamp < t1) {
            // handle ramping up and down of A
            uint256 A0 = initial_A;
            uint256 t0 = initial_A_time;
            if (A1 > A0) {
                return A0 + (A1 - A0) * (block.timestamp - t0) / (t1 - t0);
            } else {
                return A0 - (A0 - A1) * (block.timestamp - t0) / (t1 - t0);
            }
        } else {
            // when t1 == 0 or block.timestamp >= t1
            return A1;
        }
    }

    function A() external view returns (uint256) {
        return _get_A() / A_PRECISION;
    }

    function A_precise() external view returns (uint256) {
        return _get_A();
    }

    function _dynamic_fee(uint256 xpi, uint256 xpj, uint256 _fee, uint256 _feemul) internal pure returns (uint256) {
        if (_feemul <= FEE_DENOMINATOR) {
            return _fee;
        } else {
            uint256 xps2 = (xpi + xpj) * (xpi + xpj);  // Doing just ** 2 can overflow apparently
            return (_feemul * _fee) / ((_feemul - FEE_DENOMINATOR) * 4 * xpi * xpj / xps2 + FEE_DENOMINATOR);
        }
    }

    function dynamic_fee(uint256 i, uint256 j) external view returns (uint256) {
        uint256[N_COINS] memory precisions = PRECISION_MUL;
        uint256 xpi = (ERC20(coins[i]).balanceOf(address(this)) - admin_balances[i]) * precisions[i];
        uint256 xpj = (ERC20(coins[j]).balanceOf(address(this)) - admin_balances[j]) * precisions[j];
        return _dynamic_fee(xpi, xpj, fee, offpeg_fee_multiplier);
    }

    function balances(uint256 i) external view returns (uint256) {
        return ERC20(coins[i]).balanceOf(address(this)) - admin_balances[i];
    }

    function _balances() internal view returns (uint256[N_COINS] memory) {
        uint256[N_COINS] memory result;
        for (uint256 i = 0; i < N_COINS; i++) {
            result[i] = ERC20(coins[i]).balanceOf(address(this)) - admin_balances[i];
        }
        return result;
    }

     function get_D(uint256[N_COINS] memory xp, uint256 amp) internal pure returns (uint256) {
        uint256 S = 0;

        for (uint256 i = 0; i < N_COINS; i++) {
            S += xp[i];
        }
        if (S == 0) {
            return 0;
        }

        uint256 Dprev = 0;
        uint256 D = S;
        uint256 Ann = amp * N_COINS;
        for (uint256 _i = 0; _i < 255; _i++) {
            uint256 D_P = D;
            for (uint256 i = 0; i < N_COINS; i++) {
                D_P = D_P * D / (xp[i] * N_COINS + 1);  // +1 is to prevent /0
            }
            Dprev = D;
            D = (Ann * S / A_PRECISION + D_P * N_COINS) * D / ((Ann - A_PRECISION) * D / A_PRECISION + (N_COINS + 1) * D_P);
            // Equality with the precision of 1
            if (D > Dprev) {
                if (D - Dprev <= 1) {
                    return D;
                }
            } else {
                if (Dprev - D <= 1) {
                    return D;
                }
            }
        }
        // convergence typically occurs in 4 rounds or less, this should be unreachable!
        // if it does happen the pool is borked and LPs can withdraw via `remove_liquidity`
        revert("Convergence not reached");
    }

    function get_D_precisions(uint256[N_COINS] memory coin_balances, uint256 amp) internal view returns (uint256) {
        uint256[N_COINS] memory xp = PRECISION_MUL;
        for (uint256 i = 0; i < N_COINS; i++) {
            xp[i] *= coin_balances[i];
        }
        return get_D(xp, amp);
    }

    function get_virtual_price() external view returns (uint256) {
        uint256 D = get_D_precisions(_balances(), _get_A());
        // D is in the units similar to DAI (e.g. converted to precision 1e18)
        // When balanced, D = n * x_u - total virtual value of the portfolio
        uint256 token_supply = ERC20(lp_token).totalSupply();
        return D * PRECISION / token_supply;
    }

    function calc_token_amount(uint256[N_COINS] memory _amounts, bool is_deposit) external view returns (uint256) {
        uint256[N_COINS] memory coin_balances = _balances();
        uint256 amp = _get_A();
        uint256 D0 = get_D_precisions(coin_balances, amp);
        for (uint256 i = 0; i < N_COINS; i++) {
            if (is_deposit) {
                coin_balances[i] += _amounts[i];
            } else {
                coin_balances[i] -= _amounts[i];
            }
        }
        uint256 D1 = get_D_precisions(coin_balances, amp);
        uint256 token_amount = ERC20(lp_token).totalSupply();
        uint256 diff = is_deposit ? D1 - D0 : D0 - D1;
        return diff * token_amount / D0;
    }

    function add_liquidity(uint256[N_COINS] memory _amounts, uint256 _min_mint_amount, bool _use_underlying) external nonReentrant returns (uint256) {
        require(!is_killed, "Contract is killed");

        // Initial invariant
        // uint256 amp = _get_A();
        uint256[N_COINS] memory old_balances = _balances();
        // address lptoken = lp_token;
        uint256 token_supply = ERC20(lp_token).totalSupply();
        uint256 D0 = 0;
        if (token_supply != 0) {
            D0 = get_D_precisions(old_balances, _get_A());
        }

        uint256[N_COINS] memory new_balances = old_balances;
        for (uint256 i = 0; i < N_COINS; i++) {
            if (token_supply == 0) {
                require(_amounts[i] != 0, "Initial deposit requires all coins");
            }
            new_balances[i] += _amounts[i];
        }

        // Invariant after change
        uint256 D1 = get_D_precisions(new_balances, _get_A());
        require(D1 > D0, "Invariant after change");

        // We need to recalculate the invariant accounting for fees
        // to calculate fair user's share
        uint256[N_COINS] memory fees;
        uint256 mint_amount;
        if (token_supply != 0) {
            // Only account for fees if we are not the first to deposit
            // uint256 ys = (D0 + D1) / N_COINS;
            // uint256 _fee = fee * N_COINS / (4 * (N_COINS - 1));
            // uint256 _feemul = offpeg_fee_multiplier;
            // uint256 _admin_fee = admin_fee;
            uint256 difference;
            for (uint256 i = 0; i < N_COINS; i++) {
                uint256 ideal_balance = D1 * old_balances[i] / D0;
                uint256 new_balance = new_balances[i];
                if (ideal_balance > new_balance) {
                    difference = ideal_balance - new_balance;
                } else {
                    difference = new_balance - ideal_balance;
                }
                uint256 xs = old_balances[i] + new_balance;
                fees[i] = _dynamic_fee(xs, (D0 + D1) / N_COINS, fee * N_COINS / (4 * (N_COINS - 1)), offpeg_fee_multiplier) * difference / FEE_DENOMINATOR;
                if (admin_fee != 0) {
                    admin_balances[i] += fees[i] * admin_fee / FEE_DENOMINATOR;
                }
                new_balances[i] = new_balance - fees[i];
            }
            uint256 D2 = get_D_precisions(new_balances, _get_A());
            mint_amount = token_supply * (D2 - D0) / D0;
        } else {
            mint_amount = D1;  // Take the dust if there was any
        }

        require(mint_amount >= _min_mint_amount, "Slippage screwed you");

        // Take coins from the sender
        if (_use_underlying) {
            address lending_pool = trava_lending_pool;
            uint16 travaReferral = uint16(trava_referral);

            // Take coins from the sender
            for (uint256 i = 0; i < N_COINS; i++) {
                uint256 amount = _amounts[i];
                if (amount != 0) {
                    address coin = underlying_coins[i];
                    require(ERC20(coin).transferFrom(msg.sender, address(this), amount), "Failed transfer");
           
                    // Deposit to trava lending pool
                    ILendingPool(lending_pool).deposit(coin, amount, address(this), travaReferral);
                }
            }
        } else {
            for (uint256 i = 0; i < N_COINS; i++) {
                uint256 amount = _amounts[i];
                if (amount != 0) {
                    require(ERC20(coins[i]).transferFrom(msg.sender, address(this), amount), "Failed transfer");
                }
            }
        }

        // Mint pool tokens
        IStableSwapLP(lp_token).mint(msg.sender, mint_amount);

        emit AddLiquidity(msg.sender, _amounts, fees, D1, token_supply + mint_amount);

        return mint_amount;
    }

    function get_y(uint256 i, uint256 j, uint256 x, uint256[N_COINS] memory xp) internal view returns (uint256) {
        require(i != j, "Same coin");
        require(j >= 0 && j < N_COINS, "Invalid coin index");
        require(i >= 0 && i < N_COINS, "Invalid coin index");

        uint256 amp = _get_A();
        uint256 D = get_D(xp, amp);
        uint256 Ann = amp * N_COINS;
        uint256 c = D;
        uint256 S_ = 0;
        uint256 _x = 0;
        uint256 y_prev = 0;

        for (uint256 _i = 0; _i < N_COINS; _i++) {
            if (_i == i) {
                _x = x;
            } else if (_i != j) {
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
                    return y;
                }
            } else {
                if (y_prev - y <= 1) {
                    return y;
                }
            }
        }
        revert();
    }

     function get_dy(uint256 i, uint256 j, uint256 dx) external view returns (uint256) {
        return _get_dy(i, j, dx);
    }

    function get_dy_underlying(uint256 i, uint256 j, uint256 dx) external view returns (uint256) {
        return _get_dy(i, j, dx);
    }

    function _get_dy(uint256 i, uint256 j, uint256 dx) internal view returns (uint256) {
        uint256[N_COINS] memory xp = _balances();
        uint256[N_COINS] memory precisions = PRECISION_MUL;
        for (uint256 k = 0; k < N_COINS; k++) {
            xp[k] *= precisions[k];
        }

        uint256 x = xp[i] + dx * precisions[i];
        uint256 y = get_y(i, j, x, xp);
        uint256 dy = (xp[j] - y) / precisions[j];
        uint256 _fee = _dynamic_fee((xp[i] + x) / 2, (xp[j] + y) / 2, fee, offpeg_fee_multiplier) * dy / FEE_DENOMINATOR;
        return dy - _fee;
    }

    function exchange(uint256 i, uint256 j, uint256 dx, uint256 min_dy) external nonReentrant returns (uint256) {
        uint256 dy = _exchange(i, j, dx);
        require(dy >= min_dy, "Exchange resulted in fewer coins than expected");

        require(ERC20(coins[i]).transferFrom(msg.sender, address(this), dx));
        require(ERC20(coins[j]).transfer(msg.sender, dy));

        emit TokenExchange(msg.sender, i, dx, j, dy);

        return dy;
    }

    function exchange_underlying(uint256 i, uint256 j, uint256 dx, uint256 min_dy) external nonReentrant returns (uint256) {
        uint256 dy = _exchange(i, j, dx);
        require(dy >= min_dy, "Exchange resulted in fewer coins than expected");

        address u_coin_i = underlying_coins[i];
        address lending_pool = trava_lending_pool;
        uint16 travaReferral = uint16(trava_referral);

        require(ERC20(u_coin_i).transferFrom(msg.sender, address(this), dx));

        ILendingPool(lending_pool).deposit(u_coin_i, dx, address(this), travaReferral);
        ILendingPool(lending_pool).withdraw(underlying_coins[j], dy, msg.sender);

        emit TokenExchangeUnderlying(msg.sender, i, dx, j, dy);

        return dy;
    }

    function _exchange(uint256 i, uint256 j, uint256 dx) internal returns (uint256) {
        require(!is_killed, "Contract is killed");

        uint256[N_COINS] memory xp = _balances();
        uint256[N_COINS] memory precisions = PRECISION_MUL;
        for (uint256 k = 0; k < N_COINS; k++) {
            xp[k] *= precisions[k];
        }

        uint256 x = xp[i] + dx * precisions[i];
        uint256 y = get_y(i, j, x, xp);
        uint256 dy = xp[j] - y;
        uint256 dy_fee = dy * _dynamic_fee((xp[i] + x) / 2, (xp[j] + y) / 2, fee, offpeg_fee_multiplier) / FEE_DENOMINATOR;

        uint256 adminFee = admin_fee;
        if (adminFee != 0) {
            uint256 dy_admin_fee = dy_fee * adminFee / FEE_DENOMINATOR;
            if (dy_admin_fee != 0) {
                admin_balances[j] += dy_admin_fee / precisions[j];
            }
        }

        return (dy - dy_fee) / precisions[j];
    }

    function remove_liquidity(uint256 _amount, uint256[N_COINS] memory _min_amounts, bool _use_underlying) external nonReentrant returns (uint256[N_COINS] memory) {
        uint256[N_COINS] memory amounts = _balances();
        address lptoken = lp_token;
        uint256 total_supply = ERC20(lptoken).totalSupply();
        IStableSwapLP(lptoken).burnFrom(msg.sender, _amount);

        address lending_pool = address(0);
        if (_use_underlying) {
            lending_pool = trava_lending_pool;
        }

        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 value = amounts[i] * _amount / total_supply;
            require(value >= _min_amounts[i], "Withdrawal resulted in fewer coins than expected");
            amounts[i] = value;
            if (_use_underlying) {
                ILendingPool(lending_pool).withdraw(underlying_coins[i], value, msg.sender);
            } else {
                require(ERC20(coins[i]).transfer(msg.sender, value));
            }
        }

        uint256[N_COINS] memory fees; 
        for (uint256 i = 0; i < N_COINS; i++) {
            fees[i] = 0; 
        }

        emit RemoveLiquidity(msg.sender, amounts, fees, total_supply - _amount);

        return amounts;
    }

    function remove_liquidity_imbalance(uint256[N_COINS] memory _amounts, uint256 _max_burn_amount, bool _use_underlying) external nonReentrant returns (uint256) {
        require(!is_killed, "Contract is killed");

        // uint256 amp = _get_A();
        uint256[N_COINS] memory old_balances = _balances();
        uint256 D0 = get_D_precisions(old_balances, _get_A());
        uint256[N_COINS] memory new_balances = old_balances;
        for (uint256 i = 0; i < N_COINS; i++) {
            new_balances[i] -= _amounts[i];
        }
        uint256 D1 = get_D_precisions(new_balances, _get_A());
        // uint256 ys = (D0 + D1) / N_COINS;

        // address lptoken = lp_token;
        uint256 token_supply = ERC20(lp_token).totalSupply();
        require(token_supply != 0, "Zero total supply");

        // uint256 _fee = fee * N_COINS / (4 * (N_COINS - 1));
        // uint256 _feemul = offpeg_fee_multiplier;
        // uint256 _admin_fee = admin_fee;
        uint256[N_COINS] memory fees;
        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 ideal_balance = D1 * old_balances[i] / D0;
            uint256 new_balance = new_balances[i];
            uint256 difference = ideal_balance > new_balance ? ideal_balance - new_balance : new_balance - ideal_balance;
            uint256 xs = new_balance + old_balances[i];
            fees[i] = _dynamic_fee(xs, (D0 + D1) / N_COINS, fee * N_COINS / (4 * (N_COINS - 1)), offpeg_fee_multiplier) * difference / FEE_DENOMINATOR;
            if (admin_fee != 0) {
                admin_balances[i] += fees[i] * admin_fee / FEE_DENOMINATOR;
            }
            new_balances[i] -= fees[i];
        }
        uint256 D2 = get_D_precisions(new_balances, _get_A());

        uint256 token_amount = (D0 - D2) * token_supply / D0;
        require(token_amount != 0, "Zero tokens burned");
        require(token_amount <= _max_burn_amount, "Slippage screwed you");

        IStableSwapLP(lp_token).burnFrom(msg.sender, token_amount);

        address lending_pool = address(0);
        if (_use_underlying) {
            lending_pool = trava_lending_pool;
        }

        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 amount = _amounts[i];
            if (amount != 0) {
                if (_use_underlying) {
                    ILendingPool(lending_pool).withdraw(underlying_coins[i], amount, msg.sender);
                } else {
                    require(ERC20(coins[i]).transfer(msg.sender, amount));
                }
            }
        }

        emit RemoveLiquidityImbalance(msg.sender, _amounts, fees, D1, token_supply - token_amount);

        return token_amount;
    }

    function get_y_D(uint256 A_, uint256 i, uint256[N_COINS] memory xp, uint256 D) internal pure returns (uint256) {
        uint256 Ann = A_ * N_COINS;
        uint256 c = D;
        uint256 S_;
        uint256 _x;
        uint256 y_prev;

        for (uint256 _i = 0; _i < N_COINS; _i++) {
            if (_i != i) {
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
            if (y > y_prev) {
                if (y - y_prev <= 1) {
                    return y;
                }
            } else {
                if (y_prev - y <= 1) {
                    return y;
                }
            }
        }
        revert();
    }

     function _calc_withdraw_one_coin(uint256 _token_amount, uint256 i) internal view returns (uint256) {
        uint256 amp = _get_A();
        uint256[N_COINS] memory xp = _balances();
        uint256[N_COINS] memory precisions = PRECISION_MUL;

        for (uint256 j = 0; j < N_COINS; j++) {
            xp[j] *= precisions[j];
        }

        uint256 D0 = get_D(xp, amp);
        uint256 D1 = D0 - _token_amount * D0 / ERC20(lp_token).totalSupply();
        uint256 new_y = get_y_D(amp, i, xp, D1);

        uint256[N_COINS] memory xp_reduced = xp;
        uint256 ys = (D0 + D1) / (2 * N_COINS);

        uint256 _fee = fee * N_COINS / (4 * (N_COINS - 1));
        uint256 feemul = offpeg_fee_multiplier;
        for (uint256 j = 0; j < N_COINS; j++) {
            uint256 dx_expected = 0;
            uint256 xavg = 0;
            if (j == i) {
                dx_expected = xp[j] * D1 / D0 - new_y;
                xavg = (xp[j] + new_y) / 2;
            } else {
                dx_expected = xp[j] - xp[j] * D1 / D0;
                xavg = xp[j];
            }
            xp_reduced[j] -= _dynamic_fee(xavg, ys, _fee, feemul) * dx_expected / FEE_DENOMINATOR;
        }

        uint256 dy = xp_reduced[i] - get_y_D(amp, i, xp_reduced, D1);

        return (dy - 1) / precisions[i];
    }

    function calc_withdraw_one_coin(uint256 _token_amount, uint256 i) external view returns (uint256) {
        return _calc_withdraw_one_coin(_token_amount, i);
    }

    function remove_liquidity_one_coin(uint256 _token_amount, uint256 i, uint256 _min_amount, bool _use_underlying) external nonReentrant returns (uint256) {
        require(!is_killed, "Contract is killed");

        uint256 dy = _calc_withdraw_one_coin(_token_amount, i);
        require(dy >= _min_amount, "Not enough coins removed");

        IStableSwapLP(lp_token).burnFrom(msg.sender, _token_amount);

        if (_use_underlying) {
            ILendingPool(trava_lending_pool).withdraw(underlying_coins[i], dy, msg.sender);
        } else {
            require(ERC20(coins[i]).transfer(msg.sender, dy));
        }

        emit RemoveLiquidityOne(msg.sender, _token_amount, dy);

        return dy;
    }

    //Admin function

     function ramp_A(uint256 _future_A, uint256 _future_time) external  onlyOwner {
        // require(msg.sender == owner, "Only owner");
        require(block.timestamp >= initial_A_time + MIN_RAMP_TIME, "Insufficient time");
        require(_future_time >= block.timestamp + MIN_RAMP_TIME, "Insufficient time");

        uint256 _initial_A = _get_A();
        uint256 _future_A_p = _future_A * A_PRECISION;

        require(_future_A > 0 && _future_A < MAX_A, "Invalid future A");
        if (_future_A_p < _initial_A) {
            require(_future_A_p * MAX_A_CHANGE >= _initial_A, "Exceeds maximum change");
        } else {
            require(_future_A_p <= _initial_A * MAX_A_CHANGE, "Exceeds maximum change");
        }

        initial_A = _initial_A;
        future_A = _future_A_p;
        initial_A_time = block.timestamp;
        future_A_time = _future_time;

        emit RampA(_initial_A, _future_A_p, block.timestamp, _future_time);
    }

    function stop_ramp_get_A() external onlyOwner {
        // require(msg.sender == owner, "Only owner");

        uint256 current_A = _get_A();
        initial_A = current_A;
        future_A = current_A;
        initial_A_time = block.timestamp;
        future_A_time = block.timestamp;

        emit StopRampA(current_A, block.timestamp);
    }

    function commit_new_fee(uint256 new_fee, uint256 new_admin_fee, uint256 new_offpeg_fee_multiplier) external onlyOwner {
        // require(msg.sender == owner, "Only owner");
        require(admin_actions_deadline == 0, "Active action");
        require(new_fee <= MAX_FEE, "Fee exceeds maximum");
        require(new_admin_fee <= MAX_ADMIN_FEE, "Admin fee exceeds maximum");
        require(new_offpeg_fee_multiplier * new_fee <= MAX_FEE * FEE_DENOMINATOR, "Offpeg multiplier exceeds maximum");

        uint256 _deadline = block.timestamp + ADMIN_ACTIONS_DELAY;
        admin_actions_deadline = _deadline;
        future_fee = new_fee;
        future_admin_fee = new_admin_fee;
        future_offpeg_fee_multiplier = new_offpeg_fee_multiplier;

        emit CommitNewFee(_deadline, new_fee, new_admin_fee, new_offpeg_fee_multiplier);
    }

    function apply_new_fee() external  onlyOwner {
        // require(msg.sender == owner, "Only owner");
        require(block.timestamp >= admin_actions_deadline, "Insufficient time");
        require(admin_actions_deadline != 0, "No active action");

        admin_actions_deadline = 0;
        uint256 _fee = future_fee;
        uint256 _admin_fee = future_admin_fee;
        uint256 _fml = future_offpeg_fee_multiplier;
        fee = _fee;
        admin_fee = _admin_fee;
        offpeg_fee_multiplier = _fml;

        emit NewFee(_fee, _admin_fee, _fml);
    }

    function revert_new_parameters() external onlyOwner() {
        // require(msg.sender == owner, "Only owner");

        admin_actions_deadline = 0;
    }

    // function commit_transfer_ownership(address _owner) external {
    //     require(msg.sender == owner, "Only owner");
    //     require(transfer_ownership_deadline == 0, "Active transfer");

    //     uint256 _deadline = block.timestamp + ADMIN_ACTIONS_DELAY;
    //     transfer_ownership_deadline = _deadline;
    //     future_owner = _owner;

    //     emit CommitNewAdmin(_deadline, _owner);
    // }

    // function apply_transfer_ownership() external {
    //     require(msg.sender == owner, "Only owner");
    //     require(block.timestamp >= transfer_ownership_deadline, "Insufficient time");
    //     require(transfer_ownership_deadline != 0, "No active transfer");

    //     transfer_ownership_deadline = 0;
    //     address _owner = future_owner;
    //     owner = _owner;

    //     emit NewAdmin(_owner);
    // }

    // function revert_transfer_ownership() external {
    //     require(msg.sender == owner, "Only owner");

    //     transfer_ownership_deadline = 0;
    // }

     function withdraw_admin_fees() external onlyOwner {
        // require(msg.sender == owner, "Only owner");

        for (uint256 i = 0; i < N_COINS; i++) {
            uint256 value = admin_balances[i];
            if (value != 0) {
                transfer_out(coins[i], value);
                admin_balances[i] = 0;
            }
        }
    }

    function donate_admin_fees() external onlyOwner {
        for (uint256 i = 0; i < N_COINS; i++) {
            admin_balances[i] = 0; 
        }
    }

    function kill_me() external onlyOwner {
       
        require(kill_deadline > block.timestamp, "Deadline has passed");
        is_killed = true;
    }

    function unkill_me() external onlyOwner {
  
        is_killed = false;
    }

    function set_trava_referral(uint256 referral_code) external onlyOwner  {
        require(referral_code < 2 ** 16, "Uint16 overflow");
        trava_referral = referral_code;
    }

    function transfer_out(address coin_address, uint256 value) internal {
        if (coin_address == ROSE_ADDRESS) {
            _safeTransferROSE(msg.sender, value);
        } else {
            IERC20(coin_address).safeTransfer(msg.sender, value);
        }
    }

    function _safeTransferROSE(address to, uint256 value) internal {
        (bool success, ) = to.call{gas: rose_gas, value: value}("");
        require(success, "ROSE transfer failed");
    }

    function set_rose_gas(uint256 _rose_gas) external onlyOwner {
        require(_rose_gas >= MIN_ROSE_gas && _rose_gas <= MAX_ROSE_gas, "Illegal gas");
        rose_gas = _rose_gas;
        emit SetROSEGas(_rose_gas);
    }
}
