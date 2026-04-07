"use client";
import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { fhishClient } from '../lib/fhish';
import { VOTING_ADDRESS, PRIVATE_VOTING_ABI } from '../lib/contracts';

export function VoteButton({ proposalId, vote, label, className }: any) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const handleVote = async () => {
    setLoading(true);
    setTxHash('');
    try {
      // 1. Initialize TFHE WASM if not already done
      await fhishClient.init();

      // 2. Clear real encryption input creation
      const input = fhishClient.createEncryptedInput(VOTING_ADDRESS, address!);
      input.add32(vote);
      const encrypted = await input.encrypt();

      // 3. Execute Transaction with handle and proof
      const hash = await writeContractAsync({
        address: VOTING_ADDRESS as any,
        abi: PRIVATE_VOTING_ABI,
        functionName: 'vote',
        args: [
          encrypted.handles[0], 
          encrypted.inputProof,
          vote === 1 ? encrypted.handles[0] : "0x0000000000000000000000000000000000000000000000000000000000000000",
          encrypted.inputProof
        ],
      });
      setTxHash(hash);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={handleVote} 
        disabled={loading} 
        className={`px-6 py-4 rounded-xl font-bold border transition-all ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Confirming...' : label}
      </button>
      {txHash && (
        <p className="text-sm text-emerald-400 text-center font-medium mt-2">
          Vote cast! <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline">View TX</a>
        </p>
      )}
    </div>
  );
}
