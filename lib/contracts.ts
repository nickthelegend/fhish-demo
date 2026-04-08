export const VOTING_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT || "";
export const GATEWAY_ADDRESS = process.env.NEXT_PUBLIC_GATEWAY_CONTRACT || "";

export const PRIVATE_VOTING_ABI = [
  {
    type: "function",
    name: "vote",
    inputs: [
      { name: "handleA", type: "bytes32" },
      { name: "handleB", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestResult",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "finalTallyA",
    inputs: [],
    outputs: [{ type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "finalTallyB",
    inputs: [],
    outputs: [{ type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDecrypted",
    inputs: [],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEncryptedTallies",
    inputs: [],
    outputs: [{ type: "uint256" }, { type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "VoteCast",
    inputs: [
      { name: "voter", type: "address", indexed: true },
      { name: "handleA", type: "bytes32", indexed: false },
      { name: "handleB", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DecryptionFulfilled",
    inputs: [
      { name: "resultA", type: "uint32", indexed: false },
      { name: "resultB", type: "uint32", indexed: false },
    ],
  },
] as const;
