import { ethers } from "ethers";
import { FhishClient } from "./FhishClient";
import { FhishConfig } from "./types";

async function main() {
  const config: FhishConfig = {
    gatewayAddress: "https://gateway.sepolia.zama.ai",
    networkPublicKey: "0x00", // Placeholder
    chainId: 11155111,
    kmsAddress: "0x9D6891A6240D6130c54ae243d8005063D05fE14b",
    aclAddress: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5",
  };

  // We use a real provider to fetch the public key from the gateway/chain
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.public.blastapi.io");
  const client = new FhishClient(config, provider);

  console.log("--- STARTING PHASE 2 VALIDATION ---");
  await client.init();

  const contractAddress = "0x0000000000000000000000000000000000000000";
  const userAddress = "0x0000000000000000000000000000000000000000";

  const input1 = client.createEncryptedInput(contractAddress, userAddress);
  input1.add32(42);
  const result1 = await input1.encrypt();
  const handle1 = result1.handles[0];

  const input2 = client.createEncryptedInput(contractAddress, userAddress);
  input2.add32(42);
  const result2 = await input2.encrypt();
  const handle2 = result2.handles[0];

  // CHECK 1: Non-plaintext (not a small integer)
  const handleVal1 = ethers.toBigInt(handle1);
  if (handleVal1 === 42n || handleVal1 < 1000n) {
    throw new Error("CHECK 1 FAILED: Handle is plaintext or too small!");
  }
  console.log("CHECK 1 PASSED: handle is not plaintext ✓");

  // CHECK 2: Large opaque bytes
  if (handle1.length !== 32) {
    throw new Error(`CHECK 2 FAILED: Expected 32 bytes, got ${handle1.length}`);
  }
  console.log("CHECK 2 PASSED: handle length = 32 bytes ✓");

  // CHECK 3: Probabilistic encryption
  if (ethers.hexlify(handle1) === ethers.hexlify(handle2)) {
    throw new Error("CHECK 3 FAILED: Encryption is deterministic (handles are identical)!");
  }
  console.log("CHECK 3 PASSED: encryption is probabilistic ✓");

  console.log("--- PHASE 2 VALIDATION SUCCESSFUL ---");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
