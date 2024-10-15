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
            type: 2,
            tag: "ROSE",
            name: "ROSE-stROSE",
            code: "ROSE stROSE",
            address: "0x74c02D304bC239cEA2e480FE3F951834443abef2",
            lpAddress: {
                symbol: "Stable-LP",
                address: "0x1F85153B290dA636138E9B2eFeBB9019BC1d00a4",
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
                    address: "0xf001eb69fd0b4060db7397d70ec2edcd5d89cb27",
                    decimals: 18,
                },
            ],
            fee: 0.04,
            DAOFee: 0.002,
        },
    ],
};
