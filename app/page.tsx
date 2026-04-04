import { ProposalCard } from '../components/ProposalCard';
import { ConnectWallet } from '../components/ConnectWallet';

export default function Home() {
  return (
    <main className="flex flex-col gap-8 py-8">
      <header className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">fhish DAO <span className="text-gray-500">— Private Voting</span></h1>
          <p className="text-xl text-gray-400">Your vote is encrypted. Only the result is revealed.</p>
        </div>
        <ConnectWallet />
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <ProposalCard proposalId={1} active={true} revealed={false} yesVotes={0} noVotes={0} />
      </div>
    </main>
  );
}
