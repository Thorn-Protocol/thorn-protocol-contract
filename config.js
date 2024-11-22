export const NETWORKS = {
    sapphireTestnet: {
        chainId: 23295,
    },
    sapphireMainnet: {
        chainId: 23294,
    },
};

export const coins = {
    [NETWORKS.sapphireTestnet.chainId]: [
        {
            symbol: "USDe",
            address: "0xEC433B8B6F204Ca7c762941CF85bf6Df91B0549b",
            decimals: "18",
        },
        {
            symbol: "USDC",
            address: "0x1DD8219c8A8f2fF453fd19F775e3dA8c0501E768",
            decimals: "6",
        },
        {
            symbol: "FRAX",
            address: "0xa804Fb15BB29Bb3a355bdd6d85CC75D6B549BB73",
            decimals: "18",
        },
        {
            symbol: "PYUSD",
            address: "0xE5726B30E2BD4389F61F8b8793bdA40Ea6629299",
            decimals: "6",
        },
        {
            symbol: "USDT",
            address: "0x9DA08dDBCB74e9BDf309C7fa94F3b7AFB3341EB2",
            decimals: "6",
        },
        {
            symbol: "LUSD",
            address: "0x78f5c63de590553BAAA6381c9CE0F24e162b6E03",
            decimals: "18",
        },
        {
            symbol: "ETH",
            address: "0xCb4D186B2bE6e3e1fa067Ceb86EC30D6278A3a90",
            decimals: "18",
        },
        {
            symbol: "sETH",
            address: "0x8f7589CD9b63DE7a0f4C6D418aB06d69C3cc111D",
            decimals: "18",
        },
        {
            symbol: "wROSE",
            address: "0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94",
            decimals: "18",
        },
        {
            symbol: "stROSE",
            address: "0xf001eB69fD0B4060DB7397D70EC2edCD5d89Cb27",
            decimals: "18",
        },
    ],
    [NETWORKS.sapphireMainnet.chainId]: [
        {
            symbol: "ethUSDT",
            address: "0xeC240a739D04188D83E9125CECC2ea88fABd9B08",
            decimals: "6",
        },
        {
            symbol: "bscUSDT",
            address: "0x089e409616246f9f731579A684502cc8784c173b",
            decimals: "18",
        },
        {
            symbol: "ethUSDC",
            address: "0xf170d8b2e7280A495aF181aDE4c18f67bEfD9941",
            decimals: "6",
        },
        {
            symbol: "ethETH",
            address: "0x865483BAFEd87b23cBF0fE721d4533B4Cda927B6",
            decimals: "18",
        },
        {
            symbol: "arbETH",
            address: "0x391a18914313D4aD51e50dd994CF82c79ec4904f",
            decimals: "18",
        },
    ],
};

export const listAddr = {
    [NETWORKS.sapphireTestnet.chainId]: {
        StableSwapInfo: "0xdbCF2163c0C14eCdD772a35D205F1f29B58A5f44",
        StableSwapThreePoolInfo: "0xBf4713291778Be36aB1A570C83076d3b466f70dC",
        StableSwapTwoPoolInfo: "0x4dBC46e277d85deabF6b98A75730e7cAc8f77DF7",
        StableSwapLPFactory: "0xf0F78baFE2Ae185834d8307019368Edb06266117",
        StableSwapTwoPoolDeployer: "0xFAb9a9B9e0D499C48aFB2f660AF7f38d30a0B3b0",
        StableSwapThreePoolDeployer: "0x42504f57906Dbd872de8Ed80e70d1B9cc0468cC0",
        StableSwapFactory: "0x17686dC3CebE668Bc1b574162f68D00019dD774a",
        SmartRouterHelperLibrary: "0x6c5FF7493a7bb8f3833672c295463424b1267c29",
        StableSwapRouter: "0x7EbBcae22Edb208fCb9047E557c3958Fdf390D04",
    },
    [NETWORKS.sapphireMainnet.chainId]: {
        StableSwapInfo: "0x34048af0289C7EEef37277E57C136F4Fb85373CF",
        StableSwapThreePoolInfo: "0xCFdCb6855dCF1d2094B24A0b061439E9A037FB93",
        StableSwapTwoPoolInfo: "0xe215D7b62Dc139a3F09b8eA23be12bb32a3a538d",
        StableSwapLPFactory: "0xE093000349fd504078474F8Cd0d995Bacc59a615",
        StableSwapTwoPoolDeployer: "0xbA920d999D9Dd6F04690F57D894d3737B394d8B5",
        StableSwapThreePoolDeployer: "0x510E703B46A52CE73f19fE00E2865a1E156700a4",
        StableSwapFactory: "0x1B461fAB13bf7f3a723fdCD0Aca1f01538A25Be4",
        SmartRouterHelperLibrary: "0xC9dD4C4f3a7782718b33a02CfD31D2B93582ECbE",
        StableSwapRouter: "0x226929476BC3B66dabE174fc644eCd07C53DA484",
    },
};

export const poolList = {
    [NETWORKS.sapphireTestnet.chainId]: [
        {
            type: 3,
            tag: "USD",
            name: "LUSD-USDC-USDT",
            code: "LUSD USDC USDT",
            address: "0x604e91cc8D3C33dB4aDA846CE006590082222401",
            lpAddress: {
                symbol: "LUSD/USDC/USDT",
                address: "0x551d432b42f25c2FE69497352F730339851B4dE4",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "USDC",
                    address: "0x1DD8219c8A8f2fF453fd19F775e3dA8c0501E768",
                    decimals: 6,
                },
                {
                    symbol: "LUSD",
                    address: "0x78f5c63de590553BAAA6381c9CE0F24e162b6E03",
                    decimals: 18,
                },
                {
                    symbol: "USDT",
                    address: "0x9DA08dDBCB74e9BDf309C7fa94F3b7AFB3341EB2",
                    decimals: 6,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
        {
            type: 3,
            tag: "USD",
            name: "PYUSD-FRAX-USDC",
            code: "PYUSD FRAX USDC",
            address: "0x822916531bA6FAd5094Af382557f4025390A6FAb",
            lpAddress: {
                symbol: "PYUSD/FRAX/USDC",
                address: "0xDBCd5630d87525a0a72bbe4b9637863B51dc6D40",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "USDC",
                    address: "0x1DD8219c8A8f2fF453fd19F775e3dA8c0501E768",
                    decimals: 6,
                },
                {
                    symbol: "FRAX",
                    address: "0xa804Fb15BB29Bb3a355bdd6d85CC75D6B549BB73",
                    decimals: 18,
                },
                {
                    symbol: "PYUSD",
                    address: "0xE5726B30E2BD4389F61F8b8793bdA40Ea6629299",
                    decimals: 6,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
        {
            type: 2,
            tag: "USD",
            name: "USDe-USDC",
            code: "USDe USDC",
            address: "0x45A12e648A07ACAE080B7E7af35699E9F6717DAE",
            lpAddress: {
                symbol: "USDe/USDC",
                address: "0xD339dbE7946d8713EC477F97Ba7740EA4A0E9DbD",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "USDC",
                    address: "0x1DD8219c8A8f2fF453fd19F775e3dA8c0501E768",
                    decimals: 6,
                },
                {
                    symbol: "USDe",
                    address: "0xEC433B8B6F204Ca7c762941CF85bf6Df91B0549b",
                    decimals: 18,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
        {
            type: 2,
            tag: "USD",
            name: "FRAX-USDe",
            code: "FRAX USDe",
            address: "0xFe273B710D0cC5ab6f983d8Fa4660F5F8059F9c3",
            lpAddress: {
                symbol: "FRAX/USDe",
                address: "0xf8703a39CB121E0Ca0C7c1082261f4dEaD262Ee6",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "FRAX",
                    address: "0xa804Fb15BB29Bb3a355bdd6d85CC75D6B549BB73",
                    decimals: 18,
                },
                {
                    symbol: "USDe",
                    address: "0xEC433B8B6F204Ca7c762941CF85bf6Df91B0549b",
                    decimals: 18,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
        {
            type: 2,
            tag: "ETH",
            name: "ETH-sETH",
            code: "ETH sETH",
            address: "0x78e4BF2281E0B85C84716f27235636AaA8FC569B",
            lpAddress: {
                symbol: "ETH/sETH",
                address: "0x42a9E11C394ad6a2AdF871717B592cc6117daA7f",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "sETH",
                    address: "0x8f7589CD9b63DE7a0f4C6D418aB06d69C3cc111D",
                    decimals: 18,
                },
                {
                    symbol: "ETH",
                    address: "0xCb4D186B2bE6e3e1fa067Ceb86EC30D6278A3a90",
                    decimals: 18,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
        {
            type: 2,
            tag: "ROSE",
            name: "wROSE-stROSE",
            code: "wROSE stROSE",
            address: "0x41172962De81dbDCD35f0127F3d62cb144b61EC9",
            lpAddress: {
                symbol: "wROSE/stROSE",
                address: "0x978DBD4Bf22319Bc9D75E5CaAc1d5827f2b8176c",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "wROSE",
                    address: "0xB759a0fbc1dA517aF257D5Cf039aB4D86dFB3b94",
                    decimals: 18,
                },
                {
                    symbol: "stROSE",
                    address: "0xf001eB69fD0B4060DB7397D70EC2edCD5d89Cb27",
                    decimals: 18,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
    ],
    [NETWORKS.sapphireMainnet.chainId]: [
        {
            type: 2,
            tag: "USD",
            name: "ethUSDT-bscUSDT",
            code: "ethUSDT bscUSDT",
            address: "0x125c474BA4eD49684c6143c0172a1403f6Ca968B",
            lpAddress: {
                symbol: "ethUSDT/bscUSDT",
                address: "0xF37BfE02e6750Cbc009fc9230bb1b1e588917c22",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "bscUSDT",
                    address: "0x089e409616246f9f731579A684502cc8784c173b",
                    decimals: 18,
                },
                {
                    symbol: "ethUSDT",
                    address: "0xeC240a739D04188D83E9125CECC2ea88fABd9B08",
                    decimals: 6,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
        {
            type: 2,
            tag: "USD",
            name: "ethUSDT-ethUSDC",
            code: "ethUSDT ethUSDC",
            address: "0x42E4CBF74f655dd3224b3Aa4Fdc8efcD55c96DFA",
            lpAddress: {
                symbol: "ethUSDT/ethUSDC",
                address: "0x60c2c212e3F298752e4BdC89ED5546D3A5c1DFfc",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "ethUSDT",
                    address: "0xeC240a739D04188D83E9125CECC2ea88fABd9B08",
                    decimals: 6,
                },
                {
                    symbol: "ethUSDC",
                    address: "0xf170d8b2e7280A495aF181aDE4c18f67bEfD9941",
                    decimals: 6,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
        {
            type: 2,
            tag: "ETH",
            name: "ethETH-arbETH",
            code: "ethETH arbETH",
            address: "0x7ba19d713f02e8967e72e1fCB50794D57398788c",
            lpAddress: {
                symbol: "ethETH/arbETH",
                address: "0x0a9AB43EFE1528e11BCf84F45853fb1d9D782656",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "arbETH",
                    address: "0x391a18914313D4aD51e50dd994CF82c79ec4904f",
                    decimals: 18,
                },
                {
                    symbol: "ethETH",
                    address: "0x865483BAFEd87b23cBF0fE721d4533B4Cda927B6",
                    decimals: 18,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
    ],
};

[
    {
        chainId: "23295",
        type: 2,
        tag: "ROSE",
        name: "ROSE-stROSE",
        code: "ROSE stROSE",
        address: "0x74c02D304bC239cEA2e480FE3F951834443abef2",
        lpAddress: {
            symbol: "ROSE/stROSE",
            address: "0x1F85153B290dA636138E9B2eFeBB9019BC1d00a4",
            decimals: 18,
        },
        underlyingTokens: [
            {
                symbol: "ROSE",
                address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                decimals: 18,
                isNativeToken: true,
                img: "https://assets.coingecko.com/coins/images/13162/standard/OASIS.jpg?1727698287",
            },
            {
                symbol: "stROSE",
                address: "0xf001eb69fd0b4060db7397d70ec2edcd5d89cb27",
                decimals: 18,
                isNativeToken: false,
                img: "https://resources.accumulated.finance/tokens/23295/0xf001eb69fd0b4060db7397d70ec2edcd5d89cb27.png",
            },
        ],
        totalStake: [],
        fee: 0.0004,
        DAOFee: 0.0002,
    },
    {
        chainId: "23295",
        type: 2,
        tag: "USD",
        name: "USDT-USDC",
        code: "USDT USDC",
        address: "0x16576Fa3F9CcfBb4EDB0ad1647120089323B49F1",
        lpAddress: {
            symbol: "USDT/USDC",
            address: "0xDa03cA7f93CDDcf20Dcf926a3Ad2b4E347087CdB",
            decimals: 18,
        },
        underlyingTokens: [
            {
                symbol: "USDC",
                address: "0x1DD8219c8A8f2fF453fd19F775e3dA8c0501E768",
                decimals: 6,
                isNativeToken: false,
                img: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694",
            },
            {
                symbol: "USDT",
                address: "0x9DA08dDBCB74e9BDf309C7fa94F3b7AFB3341EB2",
                decimals: 6,
                isNativeToken: false,
                img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
            },
        ],
        totalStake: [],
        fee: 0.0004,
        DAOFee: 0.0002,
    },
    {
        chainId: "23295",
        type: 2,
        tag: "USD",
        name: "tethUSDT-ThornUSD",
        code: "tethUSDT-ThornUSD",
        address: "0x4B64749253fAd5B61E1405299CF4E8c89569B382",
        lpAddress: {
            symbol: "tethUDST/ThornUSD",
            address: "0xbB479ac698D7A9669C32F9274ECC56f34e16ee13",
            decimals: 18,
        },
        underlyingTokens: [
            {
                symbol: "tethUSDT",
                address: "0x0011f28Df4943EDb1198B666ef600D8BD2f441fA",
                decimals: 6,
                isNativeToken: false,
                img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
            },
            {
                symbol: "ThornUSD",
                address: "0x853db69df2875c9A10BBefe5ddF19a4Ad5F2D064",
                decimals: 6,
                isNativeToken: false,
                img: "https://app.thornprotocol.com/favicon.ico",
            },
        ],
        totalStake: [],
        fee: 0.0004,
        DAOFee: 0.0002,
    },
    {
        chainId: "23295",
        type: 2,
        tag: "USD",
        name: "tbscUSDT-ThornUSD",
        code: "tbscUSDT-ThornUSD",
        address: "0x286878B98f9FC8d9300497cD4bA608E8978F76f6",
        lpAddress: {
            symbol: "tethUDST/ThornUSD",
            address: "0x4bBb07Dfbc10F4C03AEB60B42ecBe246D34E912c",
            decimals: 18,
        },
        underlyingTokens: [
            {
                symbol: "tbscUSDT",
                address: "0xE955c3C51CeE13d6072d4045bef75224EF08963e",
                decimals: 6,
                isNativeToken: false,
                img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
            },
            {
                symbol: "ThornUSD",
                address: "0x853db69df2875c9A10BBefe5ddF19a4Ad5F2D064",
                decimals: 6,
                isNativeToken: false,
                img: "https://app.thornprotocol.com/favicon.ico",
            },
        ],
        totalStake: [],
        fee: 0.0004,
        DAOFee: 0.0002,
    },
    {
        chainId: "23295",
        type: 2,
        tag: "USD",
        name: "TEST1-TEST2",
        code: "TEST1-TEST2",
        address: "0x5559d6A539d83d476c0081eF5116a2e595c0DC5A",
        lpAddress: {
            symbol: "TEST1/TEST2",
            address: "0x83F8D67817cdEADA92d0F837697C179903dBf3be",
            decimals: 18,
        },
        underlyingTokens: [
            {
                symbol: "TEST1",
                address: "0x4Ff2eC520749df89Dd99a624d4C1Ef169bfA87BB",
                decimals: 18,
                isNativeToken: false,
                img: "https://app.thornprotocol.com/favicon.ico",
            },
            {
                symbol: "TEST2",
                address: "0x1DeA0d588ECD1C4A50668aA294fC28Ac818ee28f",
                decimals: 18,
                isNativeToken: false,
                img: "https://app.thornprotocol.com/favicon.ico",
            },
        ],
        totalStake: [],
        fee: 0.0004,
        DAOFee: 0.0002,
    },
];
