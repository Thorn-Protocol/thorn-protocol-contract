// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IStableSwap.sol";
import "../interfaces/IStableSwapLP.sol";
import "../interfaces/IStableSwapDeployer.sol";
import "../interfaces/IStableSwapLPFactory.sol";

contract StableSwapFactory is Ownable {
     enum PoolType {
        PlainPool, 
        LendingPool,
        MetaPool
    }

    struct StableSwapPairInfo {
        address swapContract;
        address token0;
        address token1;
        address LPContract;
    }
    struct StableSwapThreePoolPairInfo {
        address swapContract;
        address token0;
        address token1;
        address token2;
        address LPContract;
    }

    struct TwoPoolParams {
        address[2] coins;
        address[2] underlying_coins;
        uint256 A;
        uint256 fee;
        uint256 admin_fee;
        address interacted_pool;
        uint256 offpeg_fee_multiplier;
    }

    struct ThreePoolParams {
        address[3] coins;
        address[3] underlying_coins;
        uint256 A;
        uint256 fee;
        uint256 admin_fee;
        address interacted_pool; 
        uint256 _offpeg_fee_multiplier;
    }

    mapping(address => mapping(address => mapping(address => StableSwapThreePoolPairInfo))) public stableSwapPairInfo;
    // Query three pool pair infomation by two tokens.
    mapping(address => mapping(address => StableSwapThreePoolPairInfo)) threePoolInfo;
    mapping(uint256 => address) public swapPairContract;

    IStableSwapLPFactory public immutable LPFactory;
    IStableSwapDeployer public immutable SwapTwoPoolDeployer;
    IStableSwapDeployer public immutable SwapThreePoolDeployer;

    address constant ZEROADDRESS = address(0);

    uint256 public pairLength;

    event NewStableSwapPair(address indexed swapContract, address tokenA, address tokenB, address tokenC, address LP);

    /**
     * @notice constructor
     * _LPFactory: LP factory
     * _SwapTwoPoolDeployer: Swap two pool deployer
     * _SwapThreePoolDeployer: Swap three pool deployer
     */
    constructor(
        IStableSwapLPFactory _LPFactory,
        IStableSwapDeployer _SwapTwoPoolDeployer,
        IStableSwapDeployer _SwapThreePoolDeployer
    ) {
        LPFactory = _LPFactory;
        SwapTwoPoolDeployer = _SwapTwoPoolDeployer;
        SwapThreePoolDeployer = _SwapThreePoolDeployer;
    }

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    function sortTokens(
        address tokenA,
        address tokenB,
        address tokenC
    )
        internal
        pure
        returns (
            address,
            address,
            address
        )
    {
        require(tokenA != tokenB && tokenA != tokenC && tokenB != tokenC, "IDENTICAL_ADDRESSES");
        address tmp;
        if (tokenA > tokenB) {
            tmp = tokenA;
            tokenA = tokenB;
            tokenB = tmp;
        }
        if (tokenB > tokenC) {
            tmp = tokenB;
            tokenB = tokenC;
            tokenC = tmp;
            if (tokenA > tokenB) {
                tmp = tokenA;
                tokenA = tokenB;
                tokenB = tmp;
            }
        }
        return (tokenA, tokenB, tokenC);
    }

    // /**
    //  * @notice createSwapPair
    //  * @param _tokenA: Addresses of ERC20 conracts .
    //  * @param _tokenB: Addresses of ERC20 conracts .
    //  * @param _A: Amplification coefficient multiplied by n * (n - 1)
    //  * @param _fee: Fee to charge for exchanges
    //  * @param _admin_fee: Admin fee
    //  */
    function createSwapPair(
        PoolType _poolType,
        TwoPoolParams memory _params
    ) external onlyOwner {
        (address _tokenA, address _tokenB) = (_params.coins[0],_params.coins[1]);
        require(
            _tokenA != ZEROADDRESS &&
                _tokenB != ZEROADDRESS &&
                _tokenA != _tokenB,
            "Illegal token"
        );
        if (_poolType == PoolType.LendingPool) {
            (address _uTokenA, address _uTokenB) = (_params.underlying_coins[0],_params.underlying_coins[1]);
            require(
            _uTokenA != ZEROADDRESS &&
                _uTokenB != ZEROADDRESS &&
                _uTokenA != _uTokenB,
            "Illegal token"
        );
        }

        (address t0, address t1) = sortTokens(_tokenA, _tokenB);
        address LP = LPFactory.createSwapLP(
            _tokenA,
            _tokenB,
            ZEROADDRESS,
            address(this)
        );
        // address LP=0x22a15f86d0f275ED3748359103B129b51b2E4817;
        address swapContract;
        if (_poolType == PoolType.PlainPool)
            swapContract = SwapTwoPoolDeployer.createSwapPair(
                t0,
                t1,
                _params.A,
                _params.fee,
                _params.admin_fee,
                msg.sender,
                LP
            );
        else if (_poolType == PoolType.LendingPool) {
           
            swapContract = SwapTwoPoolDeployer.createLendingSwapPair(
                _params.coins,
                _params.underlying_coins,
                LP,
                _params.interacted_pool,
                _params.A,
                _params.fee,
                _params.admin_fee,
                _params.offpeg_fee_multiplier,
                msg.sender
            );
        } 
        // else if (_poolType == PoolType.MetaPool){
        //     (
        //         address[2] memory coins,
        //         ,
        //         uint256 A,
        //         uint256 fee,
        //         uint256 admin_fee,
        //         address base_pool,
        //         address pool_token,
        //         ,
        //     ) = _params;
        //     swapContract = SwapTwoPoolDeployer.createMetaSwapPair(coins,pool_token,base_pool,A,fee,admin_fee);

        // }
            
        IStableSwapLP(LP).setMinter(swapContract);
        addPairInfoInternal(swapContract, t0, t1, ZEROADDRESS, LP);
    }

    /**
     * @notice createThreePoolPair
     * @param _tokenA: Addresses of ERC20 conracts .
     * @param _tokenB: Addresses of ERC20 conracts .
     * @param _tokenC: Addresses of ERC20 conracts .
     * @param _A: Amplification coefficient multiplied by n * (n - 1)
     * @param _fee: Fee to charge for exchanges
     * @param _admin_fee: Admin fee
     */
    function createThreePoolPair(
        address _tokenA,
        address _tokenB,
        address _tokenC,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee
    ) external onlyOwner {
        require(
            _tokenA != ZEROADDRESS &&
                _tokenB != ZEROADDRESS &&
                _tokenC != ZEROADDRESS &&
                _tokenA != _tokenB &&
                _tokenA != _tokenC &&
                _tokenB != _tokenC,
            "Illegal token"
        );
        (address t0, address t1, address t2) = sortTokens(_tokenA, _tokenB, _tokenC);
        address LP = LPFactory.createSwapLP(t0, t1, t2, address(this));
        address swapContract = SwapThreePoolDeployer.createSwapPair(t0, t1, t2, _A, _fee, _admin_fee, msg.sender, LP);
        IStableSwapLP(LP).setMinter(swapContract);
        addPairInfoInternal(swapContract, t0, t1, t2, LP);
    }

    function addPairInfoInternal(
        address _swapContract,
        address _t0,
        address _t1,
        address _t2,
        address _LP
    ) internal {
        StableSwapThreePoolPairInfo storage info = stableSwapPairInfo[_t0][_t1][_t2];
        info.swapContract = _swapContract;
        info.token0 = _t0;
        info.token1 = _t1;
        info.token2 = _t2;
        info.LPContract = _LP;
        swapPairContract[pairLength] = _swapContract;
        pairLength += 1;
        if (_t2 != ZEROADDRESS) {
            addThreePoolPairInfo(_t0, _t1, _t2, info);
        }

        emit NewStableSwapPair(_swapContract, _t0, _t1, _t2, _LP);
    }

    function addThreePoolPairInfo(
        address _t0,
        address _t1,
        address _t2,
        StableSwapThreePoolPairInfo memory info
    ) internal {
        threePoolInfo[_t0][_t1] = info;
        threePoolInfo[_t0][_t2] = info;
        threePoolInfo[_t1][_t2] = info;
    }

    function addPairInfo(address _swapContract) external onlyOwner {
        IStableSwap swap = IStableSwap(_swapContract);
        uint256 N_COINS = swap.N_COINS();
        if (N_COINS == 2) {
            addPairInfoInternal(_swapContract, swap.coins(0), swap.coins(1), ZEROADDRESS, swap.token());
        } else if (N_COINS == 3) {
            addPairInfoInternal(_swapContract, swap.coins(0), swap.coins(1), swap.coins(2), swap.token());
        }
    }

    function getPairInfo(address _tokenA, address _tokenB) external view returns (StableSwapPairInfo memory info) {
        (address t0, address t1) = sortTokens(_tokenA, _tokenB);
        StableSwapThreePoolPairInfo memory pairInfo = stableSwapPairInfo[t0][t1][ZEROADDRESS];
        info.swapContract = pairInfo.swapContract;
        info.token0 = pairInfo.token0;
        info.token1 = pairInfo.token1;
        info.LPContract = pairInfo.LPContract;
    }

    function getThreePoolPairInfo(address _tokenA, address _tokenB)
        external
        view
        returns (StableSwapThreePoolPairInfo memory info)
    {
        (address t0, address t1) = sortTokens(_tokenA, _tokenB);
        info = threePoolInfo[t0][t1];
    }
}
