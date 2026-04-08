import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from './ClientProviders';
import { DebugPanel } from '../components/DebugPanel';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'fhish DAO',
  description: 'Private Voting on Ethereum',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className={`${inter.className} min-h-screen container mx-auto p-4`}>
        <ClientProviders>
          {children}
          <DebugPanel />
        </ClientProviders>
      </body>
    </html>
  );
}
