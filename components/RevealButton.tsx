"use client";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { VOTING_ADDRESS, PRIVATE_VOTING_ABI } from "../lib/contracts";

function log(prefix: string, ...args: any[]) {
  console.log(`[RevealButton] ${prefix}`, ...args);
}

export function RevealButton({ proposalId }: { proposalId: number }) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const { writeContractAsync } = useWriteContract();

  const handleReveal = async () => {
    log("handleReveal", "START — proposalId=", proposalId);

    setLoading(true);
    setError("");

    try {
      log("handleReveal", "Calling contract.requestResult()...");
      const txStart = Date.now();
      const hash = await writeContractAsync({
        address: VOTING_ADDRESS as `0x${string}`,
        abi: PRIVATE_VOTING_ABI,
        functionName: "requestResult",
      });
      log("handleReveal", "★ Tx submitted:", hash);
      log("handleReveal", "Duration:", Date.now() - txStart, "ms");

      setRequested(true);
      setTxHash(hash);
    } catch (e: any) {
      const msg = e.message || String(e);
      log("handleReveal", "❌ FAILED:", msg);
      setError(msg);
      alert("Error: " + msg);
    }

    setLoading(false);
    log("handleReveal", "END");
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <button
        onClick={handleReveal}
        disabled={loading || requested}
        className="w-full py-4 bg-white text-black font-black uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {loading ? "Requesting..." : requested ? "Waiting for Relayer..." : "Reveal Tally"}
      </button>
      {requested && (
        <div className="text-center p-4 bg-black/50 border border-gray-800 rounded-2xl">
          <p className="text-gray-400 text-sm font-medium">
            Decryption requested. The relayer will post the results shortly. (Takes ~10-20s)
          </p>
          {txHash && (
            <p className="text-gray-500 text-xs mt-2">
              TX: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline">{txHash.slice(0, 16)}...</a>
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-rose-400 text-center">Failed: {error.slice(0, 100)}</p>
      )}
    </div>
  );
}
