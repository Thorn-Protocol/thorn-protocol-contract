export const NETWORKS = {
  sapphireTestnet: {
    chainId: 23295,
  },
  sapphireMainnet: {
    chainId: 23294,
  }
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
    }
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
    {
      symbol: "stROSE",
      address: "0xEd57966f1566dE1a90042d07403021Ea52ad4724",
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
    StableSwapInfo: "0x45Fbc18Fb1234D80d6C8F684237D86515bCf06CD",
    StableSwapThreePoolInfo: "0xC9389b191bB00379721851Dea327Be163072EaFD",
    StableSwapTwoPoolInfo: "0x84802a969d7Faa19443E1a3c8b597fE63CdC81b0",
    StableSwapLPFactory: "0x929b531041296912b4418f0Ce4e82A2d8CBEDC28",
    StableSwapTwoPoolDeployer: "0x6c55fa71AaAd16aD33915b14F9a960fdfF3bD955",
    StableSwapThreePoolDeployer: "0xB4665ADc7bdB5026d55eccAe33fCf815AA7706F1",
    StableSwapFactory: "0xc9A37dF62aFFD760D255F8d2C49aB9217A6A3e5e",
    SmartRouterHelperLibrary: "0x1503454cEF9ebE983D9357bb83F2E5c362021a92",
    StableSwapRouter: "0x2CB5aA9dEd179fa431b1dfFe23E1c78502d503B4",
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
      address: "0xC1B9AB8Ec089bF38b37665C977c3091673da845B",
      lpAddress: {
        symbol: "ethUSDT/bscUSDT",
        address: "0xF22196B8F53d1C13668C9F7AF92C5cfDf70b93a4",
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
      address: "0x70e90A7631E96C3412dfc6738981D5558537CfBC",
      lpAddress: {
        symbol: "ethUSDT/ethUSDC",
        address: "0x5B30625ccfF3a269B9B3E33e7476a76Fe49C4DCB",
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
      address: "0xC467e9Fa23801Edd21FcA05A024819608fD2fc2e",
      lpAddress: {
        symbol: "ethETH/arbETH",
        address: "0xE831c9F5e16d07483a95099f98A90d06F638EAf1",
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
    {
      type: 2,
      tag: "ROSE",
      name: "ROSE-stROSE",
      code: "ROSE stROSE",
      address: "0xb1DE4a3A345d86fE0bBb9bF69b5CaD307072BA8F",
      lpAddress: {
        symbol: "ROSE/stROSE",
        address: "0x3EE13b81fe1f5e8cf949f0909e41c98a6d4b489F",
        decimals: 18,
      },
      underlyingTokens: [
        {
          symbol: "stROSE",
          address: "0xEd57966f1566dE1a90042d07403021Ea52ad4724",
          decimals: 18,
        },
        {
          symbol: "ROSE",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          decimals: 18,
        },
      ],
      fee: 0.0025,
      DAOFee: 0.0015,
    },
  ],
};
