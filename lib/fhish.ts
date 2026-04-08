import { ethers } from "ethers";
import { FhishClient } from "./sdk/FhishClient";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia.publicnode.com";
const gatewayUrl = process.env.NEXT_PUBLIC_FHISH_GATEWAY_URL || "http://localhost:8080";

export function createFhishClient(provider: ethers.Provider, signer?: ethers.Signer): FhishClient {
  return new FhishClient(
    {
      gatewayUrl,
      chainId: 11155111,
      gatewayAddress: process.env.NEXT_PUBLIC_GATEWAY_CONTRACT || "",
    },
    provider,
    signer
  );
}

export const publicProvider = new ethers.JsonRpcProvider(rpcUrl);
