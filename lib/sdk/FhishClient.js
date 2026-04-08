// src/FhishClient.ts
var DEFAULT_GATEWAY_URL = "http://localhost:8080";
function log(prefix, ...args) {
  console.log(`[FhishSDK] ${prefix}`, ...args);
}
var tfheLoaded = null;
var initPromise = null;
async function initTfhe(gatewayUrl, wasmUrl) {
  if (tfheLoaded) {
    log("initTfhe", "tfhe already loaded, returning cached");
    return tfheLoaded;
  }
  if (initPromise) {
    log("initTfhe", "tfhe loading in progress, awaiting...");
    return initPromise;
  }
  initPromise = (async () => {
    log("initTfhe", "Loading tfhe module via dynamic import...");
    const tfhe = await import("tfhe");
    log("initTfhe", "tfhe module loaded, types:", Object.keys(tfhe).filter((k) => k.startsWith("Fhe") || k.startsWith("Tfhe")).join(", "));
    const resolvedWasmUrl = wasmUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/tfhe_bg.wasm` : `${gatewayUrl}/tfhe_bg.wasm`);
    log("initTfhe", "WASM URL resolved to:", resolvedWasmUrl);
    log("initTfhe", "Initializing tfhe WASM...");
    await tfhe.default({ locateFile: () => resolvedWasmUrl });
    log("initTfhe", "[OK] tfhe WASM initialized successfully");
    tfheLoaded = tfhe;
    return tfhe;
  })();
  return initPromise;
}
var FhishClient = class {
  config;
  provider;
  signer;
  publicKey = null;
  clientKey = null;
  gatewayUrl;
  initialized = false;
  constructor(config, provider, signer) {
    log("Constructor", "Creating FhishClient");
    log("Constructor", "Config:", JSON.stringify({
      gatewayAddress: config.gatewayAddress ?? "(none)",
      chainId: config.chainId
    }));
    log("Constructor", "gatewayUrl:", config.gatewayUrl ?? DEFAULT_GATEWAY_URL);
    log("Constructor", "signer:", signer ? "provided" : "none");
    this.config = {
      gatewayAddress: config.gatewayAddress ?? "",
      gatewayContractAddress: config.gatewayContractAddress ?? "",
      networkPublicKey: config.networkPublicKey ?? "",
      chainId: config.chainId ?? 11155111,
      kmsAddress: config.kmsAddress ?? "",
      aclAddress: config.aclAddress ?? ""
    };
    this.provider = provider;
    this.signer = signer;
    this.gatewayUrl = config.gatewayUrl ?? DEFAULT_GATEWAY_URL;
  }
  async init() {
    if (this.initialized) {
      log("init", "Already initialized, skipping");
      return;
    }
    log("init", "Starting initialization...");
    log("init", "Fetching public key from gateway:", `${this.gatewayUrl}/get-public-key`);
    const tfhe = await initTfhe(this.gatewayUrl, `${this.gatewayUrl}/tfhe_bg.wasm`);
    log("init", "tfhe ready, fetching public key...");
    const publicKeyHex = await this.fetchPublicKey();
    log("init", "Public key received:", `${publicKeyHex.slice(0, 20)}... (${publicKeyHex.length} chars)`);
    const publicKeyBytes = this.hexToBytes(publicKeyHex);
    log("init", "Deserializing public key from", publicKeyBytes.length, "bytes...");
    this.publicKey = tfhe.TfheCompressedPublicKey.deserialize(publicKeyBytes);
    log("init", "[OK] Public key deserialized successfully");
    this.initialized = true;
    log("init", "\u2605 FhishClient fully initialized");
  }
  async initWithClientKey(clientKeyHex) {
    if (this.initialized) {
      log("initWithClientKey", "Already initialized, skipping");
      return;
    }
    log("initWithClientKey", "Initializing with client key...");
    const tfhe = await initTfhe(this.gatewayUrl, `${this.gatewayUrl}/tfhe_bg.wasm`);
    const clientKeyBytes = this.hexToBytes(clientKeyHex);
    log("initWithClientKey", "Deserializing client key from", clientKeyBytes.length, "bytes...");
    this.clientKey = tfhe.TfheClientKey.deserialize(clientKeyBytes);
    log("initWithClientKey", "[OK] Client key deserialized successfully");
    this.initialized = true;
    log("initWithClientKey", "\u2605 FhishClient initialized with client key");
  }
  isInitialized() {
    return this.initialized;
  }
  getPublicKeyHex() {
    if (!this.publicKey) throw new Error("Client not initialized");
    return this.bytesToHex(this.publicKey.serialize());
  }
  decrypt32(ciphertext) {
    if (!this.clientKey) throw new Error("Client key not available \u2014 call initWithClientKey()");
    return Number(tfheLoaded.FheUint32.deserialize(ciphertext).decrypt(this.clientKey));
  }
  decryptBool(ciphertext) {
    if (!this.clientKey) throw new Error("Client key not available \u2014 call initWithClientKey()");
    return tfheLoaded.FheBool.deserialize(ciphertext).decrypt(this.clientKey);
  }
  createEncryptedInput(_contractAddress, _userAddress) {
    log("createEncryptedInput", `contract=${_contractAddress}, user=${_userAddress}`);
    if (!this.initialized || !this.publicKey || !tfheLoaded) {
      throw new Error("FhishClient not initialized \u2014 call init() first");
    }
    const tfhe = tfheLoaded;
    const publicKey = this.publicKey;
    const gatewayUrl = this.gatewayUrl;
    const bytesToHex = (bytes) => this.bytesToHex(bytes);
    const items = [];
    const state = {
      ciphertexts: [],
      httpHandles: []
    };
    return {
      add(value) {
        items.push({ type: "uint32", value: Number(value) });
        return this;
      },
      add32(value) {
        items.push({ type: "uint32", value: Number(value) });
        return this;
      },
      addBool(value) {
        items.push({ type: "bool", value });
        return this;
      },
      async encrypt() {
        log("EncryptedInput.encrypt", "Encrypting", items.length, "items");
        state.ciphertexts = [];
        state.httpHandles = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          log(`EncryptedInput.encrypt[${i}]`, `Type=${item.type}, Value=${item.value}`);
          let ct;
          try {
            if (item.type === "uint32") {
              const encrypted = tfhe.FheUint32.encrypt_with_compressed_public_key(
                Number(item.value),
                publicKey
              );
              ct = encrypted.serialize();
            } else {
              const encrypted = tfhe.FheBool.encrypt_with_compressed_public_key(
                Boolean(item.value),
                publicKey
              );
              ct = encrypted.serialize();
            }
            log(`EncryptedInput.encrypt[${i}]`, "[OK] Ciphertext:", ct.length, "bytes");
            state.ciphertexts.push(ct);
          } catch (err) {
            log(`EncryptedInput.encrypt[${i}]`, "[ERROR] Encryption failed:", err.message);
            throw new Error(`Encryption failed: ${err.message}`);
          }
        }
        for (let i = 0; i < state.ciphertexts.length; i++) {
          const ct = state.ciphertexts[i];
          const hex = bytesToHex(ct);
          log(`EncryptedInput.encrypt[${i}]`, "Submitting to gateway:", `${hex.slice(0, 40)}...`);
          try {
            const res = await fetch(`${gatewayUrl}/ciphertext`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ciphertext: hex })
            });
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`/ciphertext POST failed: ${res.status} ${text}`);
            }
            const data = await res.json();
            log(`EncryptedInput.encrypt[${i}]`, "[OK] Gateway stored, handle:", data.handle);
            state.httpHandles.push(data.handle);
          } catch (err) {
            log(`EncryptedInput.encrypt[${i}]`, "[ERROR] Gateway failed:", err.message);
            throw err;
          }
        }
        log("EncryptedInput.encrypt", "\u2605 Encryption complete");
        return { handles: state.httpHandles, ciphertexts: state.ciphertexts };
      },
      async submitToGateway(_signer, _gatewayContractAddress) {
        return { handles: state.httpHandles };
      }
    };
  }
  async signPermit(contractAddress) {
    log("signPermit", "Signing permit for contract:", contractAddress);
    if (!this.signer) throw new Error("Signer required for permit signing");
    if (!this.publicKey) throw new Error("Client not initialized");
    const publicKeyHex = this.getPublicKeyHex();
    const domain = {
      name: "Fhish",
      version: "1",
      chainId: this.config.chainId,
      verifyingContract: contractAddress
    };
    const types = {
      FhishPermit: [
        { name: "publicKey", type: "bytes" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };
    const deadline = Math.floor(Date.now() / 1e3) + 3600;
    const message = {
      publicKey: publicKeyHex,
      nonce: 0,
      deadline
    };
    const signature = await this.signer.signTypedData(domain, types, message);
    log("signPermit", "[OK] Signature obtained");
    return {
      publicKey: publicKeyHex,
      signature,
      privateKey: ""
    };
  }
  async fetchPublicKey() {
    const url = `${this.gatewayUrl}/get-public-key`;
    log("fetchPublicKey", "Fetching from:", url);
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gateway /get-public-key failed: ${res.status} \u2014 ${text}`);
    }
    const data = await res.json();
    log("fetchPublicKey", "Response: publicKeyLen=", data.publicKey.length);
    return data.publicKey;
  }
  bytesToHex(bytes) {
    return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  hexToBytes(hex) {
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
    }
    return bytes;
  }
};

// src/utils.ts
import { ethers } from "ethers";
function bytesToBigInt(bytes) {
  return BigInt(ethers.hexlify(bytes));
}
function bigIntToBytes(value) {
  let hex = value.toString(16);
  if (hex.length % 2 !== 0) hex = "0" + hex;
  return ethers.getBytes("0x" + hex);
}
function toHexString(bytes) {
  return ethers.hexlify(bytes);
}
function fromHexString(hex) {
  return ethers.getBytes(hex);
}
export {
  FhishClient,
  bigIntToBytes,
  bytesToBigInt,
  fromHexString,
  initTfhe,
  toHexString
};
