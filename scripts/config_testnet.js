export const NETWORK = {
    sapphireTestnet: {
        chainId: 0x5aff,
    },
};

export const coins = [];

export const listAddr = {
    [NETWORK.sapphireTestnet.chainId]: {
        SmartRouterHelperLibrary: "0x21e2d0830465091bCDDeA5eBEAb075A27647a2E8",
        StableSwapInfo: "0xf559BFd84F18956452f4f89aeeFD102FcE66A366",
        StableSwapThreePoolInfo: "0x15AAED3B2E3C1BFe3642D5C55D10826A977f1f65",
        StableSwapTwoPoolInfo: "0xa6ee65626fd8fE4BB47C8eb717c1634995140C61",
        StableSwapLPFactory: "0x779d19542BA8FCa29b848aD8B6a92D512052d8C4",
        StableSwapTwoPoolDeployer: "0xCD9C3eCB05e3dbdcDfF19C9a7765a7c65753Df52",
        StableSwapThreePoolDeployer: "0x20e9b35cE615FbA38340a93B2d69E106b736fa35",
        StableSwapFactory: "0x10f5A4b5f18127993F5A129eB61F71A947cFf67F",
        StableSwapRouter: "0x32d5eCe97D58D80000Bf265A21fE2C5F80388551",
    },
};

export const poolList = {
    [NETWORK.sapphireTestnet.chainId]: [
        {
            type: 3,
            tag: "USD",
            name: "3Pool",
            code: "USDC USDT DAI",
            address: "0x87d41Dc34e9a685E476f2859C18AfFa12e03dF34",
            lpAddress: {
                symbol: "crvUSD",
                address: "0x510650f33F7c11fA5E590876beFF793282d96839",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "USDT",
                    address: "0x23c0E9Ee4f639BBED3689Db1659a50148116195D",
                    decimals: 6,
                },
                {
                    symbol: "USDC",
                    address: "0xB649cF2Fca36CaB5dCd4aFC51cC901a4b3cff4a8",
                    decimals: 6,
                },
                {
                    symbol: "DAI",
                    address: "0xc78F6eA52991BFB16e22d0A2134c78f478b25913",
                    decimals: 18,
                },
            ],
            fee: 0.01,
            DAOFee: 0.005,
        },
        {
            type: 3,
            tag: "ETH",
            name: "srvETH",
            code: "sETH rETH vETH",
            address: "0xD278abA02C181bae1644ba1275663Bbc23194C1B",
            lpAddress: {
                symbol: "srvETH",
                address: "0x22a0AE491c50f4c1CEB417b04965A02f54B32558",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "rETH",
                    address: "0xc8a31c0fbbebFcA00f353b7DC72a6A1D4112287C",
                    decimals: 18,
                },
                {
                    symbol: "vETH",
                    address: "0xE36AeaB3AE715a436380452391EEFa2cD653b475",
                    decimals: 18,
                },
                {
                    symbol: "sETH",
                    address: "0xEF86D06992e8440ACA9Ab34b3B7d407C5cb2934d",
                    decimals: 18,
                },
            ],
            fee: 0.01,
            DAOFee: 0.005,
        },
        {
            type: 2,
            tag: "BNB",
            name: "sBNB-vBNB",
            code: "sBNB vBNB",
            address: "0x8e37dfbFF2C00993d50DDDfeA97ec2c3C8ED4c6D",
            lpAddress: {
                symbol: "svBNB",
                address: "0x45ac7D9914A54FFd857dD62Cc161b350454E7D89",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "vBNB",
                    address: "0x312F99EEfa77C1b2E6712CBbC1Bbb17DD5745D77",
                    decimals: 18,
                },
                {
                    symbol: "sBNB",
                    address: "0x39557d6aA3ed5efD7c1aD977c16bDb2aC99716f8",
                    decimals: 18,
                },
            ],
            fee: 0.01,
            DAOFee: 0.005,
        },
        {
            type: 2,
            tag: "USD",
            name: "sUSDC-sUSDT",
            code: "sUDSC sUSDT",
            address: "0xd49D92b23efbB64d1270A28f07B150962a2bD896",
            lpAddress: {
                symbol: "sUSDCT",
                address: "0xE7792dF0E61179e76778B03adccB77f630667272",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "sUSDT",
                    address: "0x98E1A535ED35ED4aB75AB41615227325521077DD",
                    decimals: 6,
                },
                {
                    symbol: "sUSDC",
                    address: "0xa287B7dB0d4a210735B95E163cC35419e0ec4332",
                    decimals: 6,
                },
            ],
            fee: 0.01,
            DAOFee: 0.005,
        },
        {
            type: 2,
            tag: "USD",
            name: "sUSDC-USDC",
            code: "sUDSC USDC",
            address: "0xc5144F1465Ef5c973bF0570Da15fDa5932976108",
            lpAddress: {
                symbol: "sUSDC/USDC",
                address: "0x6342213Ef85edACd8a1dAAdc765e64C21Dc33aA1",
                decimals: 18,
            },
            underlyingTokens: [
                {
                    symbol: "sUSDC",
                    address: "0xa287B7dB0d4a210735B95E163cC35419e0ec4332",
                    decimals: 6,
                },
                {
                    symbol: "USDC",
                    address: "0xB649cF2Fca36CaB5dCd4aFC51cC901a4b3cff4a8",
                    decimals: 6,
                },
            ],
            fee: 0.01,
            DAOFee: 0.005,
        },
    ],
};
