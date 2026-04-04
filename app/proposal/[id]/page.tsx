"use client";
import { useAccount, useReadContract } from 'wagmi';
import { VOTING_ADDRESS, PRIVATE_VOTING_ABI } from '../../../lib/contracts';
import { VoteButton } from '../../../components/VoteButton';
import { RevealButton } from '../../../components/RevealButton';
import { ConnectWallet } from '../../../components/ConnectWallet';

export default function ProposalDetail({ params }: { params: { id: string } }) {
  const proposalId = parseInt(params.id);
  const { isConnected } = useAccount();

  const { data: status } = useReadContract({
    address: VOTING_ADDRESS as any,
    abi: PRIVATE_VOTING_ABI,
    functionName: 'getProposalStatus',
    args: [proposalId],
    query: {
      refetchInterval: 2000
    }
  });

  const active = status ? (status as any)[0] : true;
  const revealed = status ? (status as any)[1] : false;
  const yesVotes = status ? Number((status as any)[2]) : 0;
  const noVotes = status ? Number((status as any)[3]) : 0;

  return (
    <main className="max-w-3xl mx-auto py-12">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white">Proposal #{proposalId.toString()}</h1>
        <ConnectWallet />
      </header>

      <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-10 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-100 leading-tight">Fund Marketing Initiative</h2>
        <p className="text-xl text-gray-400 mb-12 leading-relaxed">
          The DAO Treasury currently holds substantial reserves. This proposal seeks to allocate a budget for the upcoming global marketing campaign to increase protocol adoption.
        </p>

        {revealed && (
          <div className="mb-12 bg-black/40 rounded-2xl p-8 border border-gray-800/80">
            <h3 className="text-gray-500 uppercase tracking-widest text-sm font-bold mb-6 text-center">Final Result</h3>
            <div className="flex justify-center gap-12 text-2xl">
              <div className="text-emerald-400 font-bold bg-emerald-500/10 px-8 py-4 rounded-2xl border border-emerald-500/20">YES: {yesVotes.toString()}</div>
              <div className="text-rose-400 font-bold bg-rose-500/10 px-8 py-4 rounded-2xl border border-rose-500/20">NO: {noVotes.toString()}</div>
            </div>
            <div className={`mt-8 text-center font-black text-3xl py-4 rounded-xl uppercase tracking-widest ${yesVotes > noVotes ? 'text-emerald-400' : 'text-rose-400'}`}>
              {yesVotes > noVotes ? 'PASSED' : 'FAILED'}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {!revealed && isConnected && (
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-800">
              <VoteButton proposalId={proposalId} vote={1} label="Vote YES" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" />
              <VoteButton proposalId={proposalId} vote={0} label="Vote NO" className="bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20" />
            </div>
          )}
          
          {isConnected && !revealed && (
             <RevealButton proposalId={proposalId} />
          )}

          {!isConnected && (
            <div className="text-center p-8 bg-black/50 border border-gray-800 rounded-2xl">
              <p className="text-gray-400 font-medium">Connect your wallet to vote</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
