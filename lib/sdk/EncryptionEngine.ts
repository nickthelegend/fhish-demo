import { FhishType } from "./types";

export class EncryptionEngine {
  private initialized: boolean = false;

  async init(publicKeyBytes: Uint8Array) {
    console.log("[EncryptionEngine] Initializing with public key...");
    // In a real implementation, we would call tfhe.init()
    this.initialized = true;
    console.log("[EncryptionEngine] Initialized.");
  }

  encrypt(value: bigint | number | boolean, type: FhishType): Uint8Array {
    if (!this.initialized) {
      throw new Error("EncryptionEngine not initialized");
    }

    // Mock encryption: return the value as a 32-byte array
    const buf = Buffer.alloc(32);
    if (typeof value === "boolean") {
      buf.writeUInt8(value ? 1 : 0, 31);
    } else {
      // Simplistic big-endian write
      const val = BigInt(value);
      for (let i = 0; i < 32; i++) {
        buf[31 - i] = Number((val >> BigInt(i * 8)) & 0xffn);
      }
    }
    return new Uint8Array(buf);
  }

  serialize(ciphertext: Uint8Array): string {
    return "0x" + Buffer.from(ciphertext).toString("hex");
  }
}
