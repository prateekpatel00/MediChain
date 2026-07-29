import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { AuthProvider } from '../context/AuthContext';
import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';
import { Header } from '../components/Header';
import { WalletModal } from '../components/WalletModal';

export const metadata: Metadata = {
  title: 'MediChain | Enterprise Inter-Hospital Health Exchange',
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
      <body className="font-['Plus_Jakarta_Sans',sans-serif] min-h-screen bg-[#070D1F] text-slate-100 flex flex-col justify-between antialiased selection:bg-cyan-500/30">
        <AuthProvider>
          <WalletProvider>
            <TransactionProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <WalletModal />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: '!bg-[#0F172A] !text-slate-100 !border !border-slate-800 !shadow-2xl !text-xs',
                  duration: 5000,
                  style: {
                    background: '#0F172A',
                    color: '#F8FAFC',
                    border: '1px solid #1E293B',
                    padding: '12px 16px',
                    borderRadius: '12px',
                  },
                }}
              />
            </TransactionProvider>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
