"use client";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { createFhishClient } from "../lib/fhish";
import { VOTING_ADDRESS, PRIVATE_VOTING_ABI, GATEWAY_ADDRESS } from "../lib/contracts";

function log(prefix: string, ...args: any[]) {
  console.log(`[VoteButton] ${prefix}`, ...args);
}

export function VoteButton({ proposalId, vote, label, className }: {
  proposalId: number;
  vote: 0 | 1;
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const handleVote = async () => {
    log("handleVote", "START — proposalId=", proposalId, "vote=", vote, "label=", label);
    log("handleVote", "wallet address:", address);

    if (!address) {
      log("handleVote", "ERROR: wallet not connected");
      alert("Connect wallet first");
      return;
    }

    if (!GATEWAY_ADDRESS) {
      log("handleVote", "ERROR: GATEWAY_ADDRESS not configured");
      alert("Gateway address not configured");
      return;
    }

    setLoading(true);
    setTxHash("");
    setError("");

    try {
      log("handleVote", "Getting browser provider...");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      log("handleVote", "Provider:", provider);

      log("handleVote", "Getting signer...");
      const signer = await provider.getSigner();
      log("handleVote", "Signer address:", await signer.getAddress());

      log("handleVote", "Creating FhishClient...");
      const client = createFhishClient(provider, signer);
      log("handleVote", "FhishClient created, calling init()...");

      const initStart = Date.now();
      await client.init();
      log("handleVote", "✓ FhishClient.init() done in", Date.now() - initStart, "ms");
      log("handleVote", "Client initialized:", client.isInitialized());

      log("handleVote", "Creating encrypted input for contract:", VOTING_ADDRESS);
      const input = client.createEncryptedInput(
        VOTING_ADDRESS,
        address
      );

      log("handleVote", "Adding vote value:", vote === 1 ? "YES (1)" : "NO (0)");
      input.add32(vote === 1 ? 1 : 0);

      log("handleVote", "Encrypting votes...");
      const encryptStart = Date.now();
      const { handles: httpHandles, ciphertexts } = await input.encrypt();
      log("handleVote", "✓ Encryption done in", Date.now() - encryptStart, "ms");
      log("handleVote", "Number of ciphertexts:", ciphertexts.length);

      log("handleVote", "Submitting ciphertexts to gateway contract:", GATEWAY_ADDRESS);
      const submitStart = Date.now();
      const { handles: gatewayHandles } = await input.submitToGateway(signer, GATEWAY_ADDRESS);
      log("handleVote", "✓ Gateway submission done in", Date.now() - submitStart, "ms");
      log("handleVote", "Gateway handles:", gatewayHandles.map(h => h?.slice(0, 16) + "..."));

      const handleA = vote === 1 ? (gatewayHandles[0] || "0x0000000000000000000000000000000000000000000000000000000000000000") : "0x0000000000000000000000000000000000000000000000000000000000000000";
      const handleB = vote === 0 ? (gatewayHandles[0] || "0x0000000000000000000000000000000000000000000000000000000000000000") : "0x0000000000000000000000000000000000000000000000000000000000000000";
      log("handleVote", "handleA (YES):", handleA.slice(0, 20), "...", handleA === "0x" + "0".repeat(64) ? "(ZERO)" : "");
      log("handleVote", "handleB (NO):", handleB.slice(0, 20), "...", handleB === "0x" + "0".repeat(64) ? "(ZERO)" : "");

      log("handleVote", "Calling contract vote(handleA, handleB)...");
      const txStart = Date.now();
      const hash = await writeContractAsync({
        address: VOTING_ADDRESS as `0x${string}`,
        abi: PRIVATE_VOTING_ABI,
        functionName: "vote",
        args: [handleA, handleB],
      });
      log("handleVote", "★ Transaction submitted!");
      log("handleVote", "  txHash:", hash);
      log("handleVote", "  duration:", Date.now() - txStart, "ms");

      setTxHash(hash);
      log("handleVote", "UI updated with txHash");
    } catch (e: any) {
      const msg = e.message || String(e);
      log("handleVote", "❌ VOTE FAILED:", msg);
      setError(msg);
      alert("Error: " + msg);
    }

    setLoading(false);
    log("handleVote", "END");
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleVote}
        disabled={loading}
        className={`px-6 py-4 rounded-xl font-bold border transition-all ${className || ""} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Submitting to Gateway..." : label}
      </button>
      {txHash && (
        <p className="text-sm text-emerald-400 text-center font-medium mt-2">
          Vote cast!{" "}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View TX {txHash.slice(0, 8)}...
          </a>
        </p>
      )}
      {error && (
        <p className="text-sm text-rose-400 text-center font-medium mt-2">
          Failed: {error.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
