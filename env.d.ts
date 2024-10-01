declare global {
    namespace NodeJS {
      interface ProcessEnv {
        PRIVATE_KEY: string;
        PRIVATE_KEY_1: string;
        PRIVATE_KEY_2: string;
        PRIVATE_KEY_3: string;
        STABLE_SWAP_LP_FACTORY: string;
        STABLE_SWAP_FACTORY: string;
        STABLE_SWAP_TWO_POOL_DEPLOYER: string;
        STABLE_SWAP_THREE_POOL_DEPLOYER: string;
        STABLE_SWAP_TWO_POOL_INFO: string;
        STABLE_SWAP_THREE_POOL_INFO: string;
        SMART_ROUTER_HELPER_LIBRARY: string;
        STABLE_SWAP_INFO: string;
        PROVIDER_URL: string;
        PUBLIC_KEY: string
      }
    }
  }
  
  export {};