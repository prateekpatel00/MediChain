import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { AuthProvider } from '../context/AuthContext';
import { WalletProvider } from '../context/WalletContext';
import { TransactionProvider } from '../context/TransactionContext';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { WalletModal } from '../components/WalletModal';

export const metadata: Metadata = {
  title: 'MediChain | Enterprise Healthcare Data Protocol',
  description:
    'Decentralized, privacy-preserving inter-hospital patient record exchange powered by Stellar Soroban smart contracts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Plus_Jakarta_Sans',sans-serif] min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between antialiased selection:bg-teal-500/20 selection:text-teal-900">
        <AuthProvider>
          <WalletProvider>
            <TransactionProvider>
              <Sidebar />
              <Header />
              <div className="flex-1">{children}</div>
              <WalletModal />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: '!bg-white !text-slate-900 !border !border-slate-200 !shadow-2xl !text-xs !rounded-2xl',
                  duration: 5000,
                  style: {
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
                    padding: '12px 18px',
                    borderRadius: '16px',
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
