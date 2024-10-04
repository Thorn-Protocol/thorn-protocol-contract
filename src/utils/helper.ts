import fs from "fs";
import { toChecksumAddress } from "ethereumjs-util";
import { EthAddress } from "./type";
import { Wallet } from "ethers";
import * as hre from "hardhat";
import { network } from "hardhat";

const adminKey = {
    publicKey: process.env.PUBLIC_KEY!,
    privateKey: process.env.PRIVATE_KEY!,
};

export function getMainOwner(): Wallet {
    return new hre.ethers.Wallet(adminKey.privateKey, hre.ethers.getDefaultProvider(process.env.PROVIDER_URL));
}

export function writeToEnvFile(key: String, value: String) {
    const envFilePath = ".env";
    const envString = `${key}=${value}`;

    try {
        if (fs.existsSync(envFilePath)) {
            let data = fs.readFileSync(envFilePath, "utf8");
            const lines = data.trim().split("\n");
            let keyExists = false;
            const updatedLines = lines.map((line) => {
                const [existingKey] = line.split("=");
                if (existingKey === key) {
                    keyExists = true;
                    return envString;
                }
                return line;
            });
            if (!keyExists) {
                updatedLines.push(envString);
            }
            const updatedData = updatedLines.join("\n");
            fs.writeFileSync(envFilePath, updatedData + "\n");
        } else {
            fs.writeFileSync(envFilePath, envString + "\n");
        }
        console.log("Successfully wrote to .env file.");
    } catch (err) {
        console.error("Error writing to .env file:", err);
    }
}

export const convertHexStringToAddress = (hexString: EthAddress): EthAddress => {
    String(hexString).toLowerCase();
    const strippedHex = hexString.replace(/^0x/, "");

    return toChecksumAddress(`0x${strippedHex}`);
};

export async function getGasPrice() {
    let gasPrice = (await getMainOwner().getFeeData()).gasPrice;
    return gasPrice;
}

export async function getOption() {
    const networkName = network.name;
    let gasPrice;

    if (networkName === "bscTestnet") {
        gasPrice = "10000000000";
    }
    if (networkName === "sapphireMainnet") {
        gasPrice = await getGasPrice();
    }
    if (networkName === "sapphireTestnet") {
        return { gasLimit: 1e7, gasPrice: 100e9 };
    }

    const nonce = await getMainOwner().getTransactionCount();
    const options = { gasPrice: gasPrice, nonce: nonce };
    return options;
}
