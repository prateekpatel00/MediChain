import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';
import { Header } from '../components/Header';
import { WalletModal } from '../components/WalletModal';

export const metadata: Metadata = {
  title: 'MediChain | Inter-Hospital Health Exchange dApp',
  description:
    'Decentralized, privacy-preserving inter-hospital patient record exchange powered by Stellar Soroban smart contracts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Plus_Jakarta_Sans',sans-serif] min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between antialiased">
        <WalletProvider>
          <TransactionProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <WalletModal />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: '!bg-slate-900 !text-slate-100 !border !border-slate-800 !shadow-2xl !text-xs',
                duration: 5000,
                style: {
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #1e293b',
                  padding: '12px 16px',
                  borderRadius: '12px',
                },
              }}
            />
          </TransactionProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
