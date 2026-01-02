import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { AuraGuideChat } from '@/components/guide/AuraGuideChat';

export const metadata: Metadata = {
  title: 'AuraNova Studios',
  description: 'Your all-in-one creative platform for game development, art creation, and component building',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-slate-950 text-white">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        
        {/* Aura Guide - Floating Chat Assistant */}
        <AuraGuideChat variant="floating" />
        
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              borderRadius: '8px',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f1f5f9',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f1f5f9',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
