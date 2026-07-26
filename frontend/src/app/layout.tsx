import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediChain | Inter-Hospital Health Exchange dApp',
  description: 'Decentralized, privacy-preserving inter-hospital patient record exchange powered by Stellar Soroban smart contracts.',
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
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-['Plus_Jakarta_Sans',sans-serif] min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
