export const NETWORK = {
    sapphireTestnet: {
        chainId: 0x5aff,
    },
};

export const coins = [];

export const listAddr = {
    [NETWORK.sapphireTestnet.chainId]: {
        SmartRouterHelperLibrary: "0x68968cdE2fe5b61cEC87Ae6fdCB2fc39271893c2",
        StableSwapInfo: "0xe50516bCC168B67b5391e15E877c6a4cc3e75f00",
        StableSwapThreePoolInfo: "0xa8b20299608BB9fAf0b496Fba5cFEB14AD31DF59",
        StableSwapTwoPoolInfo: "0x8d7Dcc3bFf324e2AFf9880F4B61e10daC9C18d26",
        StableSwapLPFactory: "0x00Fc51De53DE96C7086b4df0AF810edE2776Fa98",
        StableSwapTwoPoolDeployer: "0x20973dfFa9Ee32b03f4a5e3c5A686B48FF63b1B1",
        StableSwapThreePoolDeployer: "0xcEbf9Ad6D3258A687F21398B05C0eCdcaF42ECcA",
        StableSwapFactory: "0x888099De8EA8068D92bB04b47A743B82195c4aD2",
        StableSwapRouter: "0xbfdcE45a9241870E7cF338BAaa3185972A550922",
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
