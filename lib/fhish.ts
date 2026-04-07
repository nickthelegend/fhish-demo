import { ethers } from "ethers";
// Import from the local copy 
import { FhishClient } from "./sdk/FhishClient";

const config = {
  chainId: 11155111, // Sepolia Chain ID (mandatory for Zama Gateway)
  gatewayAddress: "https://gateway.sepolia.zama.ai", 
  networkPublicKey: "", // Fetched from gateway
  // These are the LOCAL addresses we deployed in Phase 3
  kmsAddress: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6", 
  aclAddress: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
};

// BROADCAST PROVIDER: Points to our local debug node
const localProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

export const fhishClient = new FhishClient(config, localProvider);
