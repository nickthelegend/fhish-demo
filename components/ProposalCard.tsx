"use client";
import Link from 'next/link';

export function ProposalCard({ proposalId, active, revealed, yesVotes, noVotes }: any) {
  return (
    <Link href={`/proposal/${proposalId}`}>
      <div className="p-8 border border-gray-800 rounded-3xl bg-gray-900/50 hover:bg-gray-800 transition-all group cursor-pointer h-full flex flex-col justify-between hover:border-gray-600">
        <div>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Proposal #{proposalId.toString()}</h2>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'}`}>
              {revealed ? 'Revealed' : (active ? 'Active' : 'Closed')}
            </span>
          </div>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Should the DAO allocate 500 ETH to the new marketing initiative?
          </p>
        </div>
        
        {revealed ? (
          <div className="bg-black/50 rounded-2xl p-6 border border-gray-800">
            <div className="flex justify-between mb-4">
              <span className="text-emerald-400 font-bold">YES: {yesVotes.toString()}</span>
              <span className="text-rose-400 font-bold">NO: {noVotes.toString()}</span>
            </div>
            <div className={`text-center font-black text-xl py-3 rounded-xl uppercase tracking-wider ${yesVotes > noVotes ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {yesVotes > noVotes ? 'Passed' : 'Failed'}
            </div>
          </div>
        ) : (
          <div className="bg-black/50 rounded-2xl p-6 border border-gray-800 flex items-center justify-center">
            <p className="text-gray-500 text-center font-medium">Votes encrypted — tally not yet revealed</p>
          </div>
        )}
      </div>
    </Link>
  );
}
