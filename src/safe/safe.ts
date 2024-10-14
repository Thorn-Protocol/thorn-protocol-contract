import Safe from "@safe-global/protocol-kit";
import hre, { getChainId } from "hardhat";
import { CHAIN_ID } from "../utils/network";
import { ADMIN_WALLET } from "../config";

export async function getSafe() {
    let provider_rpc = "123";
    if ((await getChainId()) == CHAIN_ID.OASIS_SAPPHIRE_TESTNET) {
        provider_rpc = "https://testnet.sapphire.oasis.io";
    }

    const safeFactory = await Safe.init({
        provider: provider_rpc,
        safeAddress: ADMIN_WALLET.SAPPHIRE_TESTNET,
    });

    return safeFactory;
}
