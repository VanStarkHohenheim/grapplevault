import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import RandomButton from '@/components/RandomButton';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrappleVault',
  description: 'BJJ Video Library',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased relative`}>

        {/* ── Ambient background orbs ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {/* Orbe chaud — haut gauche */}
          <div
            className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(234,179,8,0.5) 0%, rgba(180,83,9,0.2) 50%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'float-slow 12s ease-in-out infinite',
            }}
          />
          {/* Orbe froid — haut droit */}
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(99,102,241,0.2) 50%, transparent 70%)',
              filter: 'blur(90px)',
              animation: 'float-slower 16s ease-in-out infinite',
            }}
          />
          {/* Orbe rouge — centre bas */}
          <div
            className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)',
              filter: 'blur(100px)',
              animation: 'float-slow 20s ease-in-out infinite reverse',
            }}
          />
          {/* Grain subtil */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
            }}
          />
        </div>

        {/* ── App content ── */}
        <div className="relative" style={{ zIndex: 1 }}>
          <Header />
          {children}
          <RandomButton />
        </div>

        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
