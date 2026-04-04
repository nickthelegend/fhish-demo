import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'fhish DAO',
  projectId: 'a58eb7b4a24f0c45', 
  chains: [sepolia],
  ssr: true,
});
