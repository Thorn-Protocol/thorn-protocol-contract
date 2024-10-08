// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../interfaces/IStableSwap.sol";
import "../interfaces/IStableSwapLP.sol";
import "../interfaces/IStableSwapDeployer.sol";
import "../interfaces/IStableSwapLPFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title Stable swap factory
 * @notice A factory contract for creating new pool and providing pool information
 * @dev  This contract manages the creations of stable swap pools and provides access to their information
 */

contract StableSwapFactory is Initializable {
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

    mapping(address => mapping(address => mapping(address => StableSwapThreePoolPairInfo)))
        public stableSwapPairInfo;
    // Query three pool pair infomation by two tokens.
    mapping(address => mapping(address => StableSwapThreePoolPairInfo)) threePoolInfo;
    mapping(uint256 => address) public swapPairContract;

    IStableSwapLPFactory public LPFactory;
    IStableSwapDeployer public SwapTwoPoolDeployer;
    IStableSwapDeployer public SwapThreePoolDeployer;

    address constant ZEROADDRESS = address(0);
    address public admin;

    uint256 public pairLength;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }

    /*╔══════════════════════════════╗
      ║          EVENT               ║
      ╚══════════════════════════════╝*/

    event CommitOwnership(address admin);
    event ApplyOwnership(address admin);
    event NewStableSwapPair(
        address indexed swapContract,
        address tokenA,
        address tokenB,
        address tokenC,
        address LP
    );
    event AdminshipTransferred(
        address indexed previousAdminr,
        address indexed newAdmin
    );

    /*╔══════════════════════════════╗
      ║          CONSTRUCTOR         ║
      ╚══════════════════════════════╝*/

    /**
     * @notice constructor
     * _LPFactory: LP factory
     * _SwapTwoPoolDeployer: Swap two pool deployer
     * _SwapThreePoolDeployer: Swap three pool deployer
     */

    function initialize(
        IStableSwapLPFactory _LPFactory,
        IStableSwapDeployer _SwapTwoPoolDeployer,
        IStableSwapDeployer _SwapThreePoolDeployer,
        address _admin
    ) external initializer {
        LPFactory = _LPFactory;
        SwapTwoPoolDeployer = _SwapTwoPoolDeployer;
        SwapThreePoolDeployer = _SwapThreePoolDeployer;
        admin = _admin;
    }

    /*╔══════════════════════════════╗
      ║          ADMIN FUNCTIONS     ║
      ╚══════════════════════════════╝*/

    /**
     * @notice createSwapPair
     * @param _tokenA: Addresses of ERC20 conracts .
     * @param _tokenB: Addresses of ERC20 conracts .
     * @param _A: Amplification coefficient multiplied by n * (n - 1)
     * @param _fee: Fee to charge for exchanges
     * @param _admin_fee: Admin fee
     */

    function createSwapPair(
        address _tokenA,
        address _tokenB,
        uint256 _A,
        uint256 _fee,
        uint256 _admin_fee
    ) external onlyAdmin {
        require(
            _tokenA != ZEROADDRESS &&
                _tokenB != ZEROADDRESS &&
                _tokenA != _tokenB,
            "Illegal token"
        );
        (address t0, address t1) = sortTokens(_tokenA, _tokenB);
        address LP = LPFactory.createSwapLP(t0, t1, ZEROADDRESS, address(this));
        address swapContract = SwapTwoPoolDeployer.createSwapPair(
            t0,
            t1,
            _A,
            _fee,
            _admin_fee,
            msg.sender,
            LP
        );
        IStableSwapLP(LP).setMinter(swapContract);
        addPairInfoInternal(swapContract, t0, t1, ZEROADDRESS, LP);
    }

    /**
     * @notice Sorts three token addresses in a consistent order.
     * @param tokenA: Addresses of ERC20 conracts .
     * @param tokenB: Addresses of ERC20 conracts .
     */
    function sortTokens(
        address tokenA,
        address tokenB
    ) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
    }

    /**
     * @notice Adds information about a stable swap pool pair to the contract's storage.
     * @param _swapContract: Addresses of stable swap pool contracts .
     * @param _t0: Addresses of ERC20 conracts .
     * @param _t1: Addresses of ERC20 conracts .
     * @param _t2: Addresses of ERC20 conracts .
     * @param _LP: Addresses of LP token for stable swap pool contracts .
     */
    function addPairInfoInternal(
        address _swapContract,
        address _t0,
        address _t1,
        address _t2,
        address _LP
    ) internal {
        StableSwapThreePoolPairInfo storage info = stableSwapPairInfo[_t0][_t1][
            _t2
        ];
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
    ) external onlyAdmin {
        require(
            _tokenA != ZEROADDRESS &&
                _tokenB != ZEROADDRESS &&
                _tokenC != ZEROADDRESS &&
                _tokenA != _tokenB &&
                _tokenA != _tokenC &&
                _tokenB != _tokenC,
            "Illegal token"
        );
        (address t0, address t1, address t2) = sortTokens(
            _tokenA,
            _tokenB,
            _tokenC
        );
        address LP = LPFactory.createSwapLP(t0, t1, t2, address(this));
        address swapContract = SwapThreePoolDeployer.createSwapPair(
            t0,
            t1,
            t2,
            _A,
            _fee,
            _admin_fee,
            msg.sender,
            LP
        );
        IStableSwapLP(LP).setMinter(swapContract);
        addPairInfoInternal(swapContract, t0, t1, t2, LP);
    }

    /**
     * @notice Adds information about a stable swap contract.
     * @param _swapContract: Addresses of stable swap contracts.
     */
    function addPairInfo(address _swapContract) external onlyAdmin {
        IStableSwap swap = IStableSwap(_swapContract);
        uint256 N_COINS = swap.N_COINS();
        if (N_COINS == 2) {
            addPairInfoInternal(
                _swapContract,
                swap.coins(0),
                swap.coins(1),
                ZEROADDRESS,
                swap.token()
            );
        } else if (N_COINS == 3) {
            addPairInfoInternal(
                _swapContract,
                swap.coins(0),
                swap.coins(1),
                swap.coins(2),
                swap.token()
            );
        }
    }

    /**
     * @notice Sorts three token addresses in a consistent order.
     * @param tokenA: Addresses of ERC20 conracts .
     * @param tokenB: Addresses of ERC20 conracts .
     * @param tokenC: Addresses of ERC20 conracts .
     */
    function sortTokens(
        address tokenA,
        address tokenB,
        address tokenC
    ) internal pure returns (address, address, address) {
        require(
            tokenA != tokenB && tokenA != tokenC && tokenB != tokenC,
            "IDENTICAL_ADDRESSES"
        );
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

    /**
     * @notice Adds stable swap three pool pair information,facilitating query three pool pair by two tokens .
     * @param _t0: Addresses of ERC20 conracts .
     * @param _t1: Addresses of ERC20 conracts .
     * @param _t2: Addresses of ERC20 conracts .
     * @param info: Addresses of three pool pair information contracts .
     */
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

    /*╔══════════════════════════════╗
      ║         VIEW FUNCTIONS       ║
      ╚══════════════════════════════╝*/

    /**
     * @notice Retrieves information of two pool.
     * @param _tokenA : Addresses of ERC20 conracts.
     * @param _tokenB : Addresses of ERC20 conracts.
     */
    function getPairInfo(
        address _tokenA,
        address _tokenB
    ) external view returns (StableSwapPairInfo memory info) {
        (address t0, address t1) = sortTokens(_tokenA, _tokenB);
        StableSwapThreePoolPairInfo memory pairInfo = stableSwapPairInfo[t0][
            t1
        ][ZEROADDRESS];
        info.swapContract = pairInfo.swapContract;
        info.token0 = pairInfo.token0;
        info.token1 = pairInfo.token1;
        info.LPContract = pairInfo.LPContract;
    }

    /**
     * @notice Retrieves information of three pool by two tokens.
     * @param _tokenA : Addresses of ERC20 conracts.
     * @param _tokenB : Addresses of ERC20 conracts.
     */
    function getThreePoolPairInfo(
        address _tokenA,
        address _tokenB
    ) external view returns (StableSwapThreePoolPairInfo memory info) {
        (address t0, address t1) = sortTokens(_tokenA, _tokenB);
        info = threePoolInfo[t0][t1];
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferAdminship(address newAdmin) public virtual onlyAdmin {
        require(
            newAdmin != address(0),
            "Ownable: new Admin is the zero address"
        );
        _transferAdminship(newAdmin);
    }

    /**
     * @dev Transfers Adminship of the contract to a new account (`newAdmin`).
     * Internal function without access restriction.
     */
    function _transferAdminship(address _admin) internal virtual {
        address oldAdmin = admin;
        admin = _admin;
        emit AdminshipTransferred(oldAdmin, _admin);
    }
}
