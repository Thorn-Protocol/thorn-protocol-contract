export const NETWORK = {
    sapphireTestnet: {
        chainId: 0x5aff,
    },
};

export const coins = [];

export const listAddr = {
    [NETWORK.sapphireTestnet.chainId]: {
        SmartRouterHelperLibrary: "0x6ddBFDee4Fe0B1A3415C0cc309A335ad2475811c",
        StableSwapInfo: "0x43BF204Eef9CD53dA4959A4E1b93937a530f54Ac",
        StableSwapThreePoolInfo: "0x27b7158C6Ab336F8ed4B744Bc295a10194653846",
        StableSwapTwoPoolInfo: "0xBb9ab25E81E4d6ba095dc278D244f38d7b1d4F05",
        StableSwapLPFactory: "0x48bBC7Ecc6cDd7849072AAD8a31c602Bca58fD4C",
        StableSwapTwoPoolDeployer: "0xB26C11691638b7F72C2fdCF3E337E21C6fa106Df",
        StableSwapThreePoolDeployer: "0xeb1D0087dbc99B78ABEE509B35490e98De1CE1d0",
        StableSwapFactory: "0x85E778c1Eeaee783E5f304F8cC8d82402490D2DB",
        StableSwapRouter: "0x93Be1021366c15506C0c7daad550D2E4Ebc138a3",
    },
};

export const poolList = {
    [NETWORK.sapphireTestnet.chainId]: [
        {
            type: 2,
            tag: "ROSE",
            name: "ROSE-stROSE",
            code: "ROSE stROSE",
            address: "0x10fb422Ee1300C61F03EF70b573cc7439f2Af5Aa",
            lpAddress: {
                symbol: "Stable-LP",
                address: "0x7cf09b3680EfFA5AB7D6b140387daf5c7A67EC53",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "ROSE",
                    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                    decimals: 18,
                },
                {
                    symbol: "stROSE",
                    address: "0xEd57966f1566dE1a90042d07403021Ea52ad4724",
                    decimals: 18,
                },
            ],
            fee: 0.0004,
            DAOFee: 0.0002,
        },
    ],
};
