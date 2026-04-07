import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'fhish DAO V2 - Real FHE',
  projectId: 'a58eb7b4a24f0c45', 
  chains: [hardhat, sepolia],
  ssr: true,
});
