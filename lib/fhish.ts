import FhishClient from "@fhish/sdk";

export const fhishClient = new FhishClient({
  rpcUrl: "https://rpc.sepolia.org",
  chainId: 11155111,
  gatewayAddress: process.env.NEXT_PUBLIC_GATEWAY_ADDRESS || "0x0"
});
