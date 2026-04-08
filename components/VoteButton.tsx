"use client";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { createFhishClient } from "../lib/fhish";
import { VOTING_ADDRESS, PRIVATE_VOTING_ABI } from "../lib/contracts";

const EMPTY_BYTES = "0x";

export function VoteButton({ proposalId, vote, label, className }: {
  proposalId: number;
  vote: 0 | 1;
  label: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const handleVote = async () => {
    if (!address) {
      alert("Connect wallet first");
      return;
    }
    setLoading(true);
    setTxHash("");

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const client = createFhishClient(provider, signer);
      await client.init();

      const input = client.createEncryptedInput(
        VOTING_ADDRESS,
        address
      );
      input.add32(1);
      const { handles } = await input.encrypt();

      const handleA = vote === 1 ? handles[0] : EMPTY_BYTES;
      const handleB = vote === 0 ? handles[0] : EMPTY_BYTES;

      const hash = await writeContractAsync({
        address: VOTING_ADDRESS as `0x${string}`,
        abi: PRIVATE_VOTING_ABI,
        functionName: "vote",
        args: [handleA, EMPTY_BYTES, handleB, EMPTY_BYTES],
      });
      setTxHash(hash);
    } catch (e: any) {
      console.error("Vote failed:", e);
      alert("Error: " + e.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleVote}
        disabled={loading}
        className={`px-6 py-4 rounded-xl font-bold border transition-all ${className || ""} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Confirming..." : label}
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
            View TX
          </a>
        </p>
      )}
    </div>
  );
}
