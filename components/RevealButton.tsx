"use client";
import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { VOTING_ADDRESS, PRIVATE_VOTING_ABI } from '../lib/contracts';

export function RevealButton({ proposalId }: any) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const handleReveal = async () => {
    setLoading(true);
    try {
      await writeContractAsync({
        address: VOTING_ADDRESS as any,
        abi: PRIVATE_VOTING_ABI,
        functionName: 'requestTallyReveal',
        args: [proposalId],
      });
      setRequested(true);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      <button 
        onClick={handleReveal} 
        disabled={loading || requested} 
        className="w-full py-4 bg-white text-black font-black uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {loading ? 'Requesting...' : requested ? 'Waiting for Relayer...' : 'Reveal Tally'}
      </button>
      {requested && (
         <p className="text-gray-400 text-sm text-center">
           Decryption requested. The relayer will post the results shortly. (Takes ~10-20s)
         </p>
      )}
    </div>
  );
}
