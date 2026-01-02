'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { AuraGuideChat } from '@/components/guide/AuraGuideChat';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Hide navbar and floating chat on OS page (full-screen desktop environment)
  const isOSPage = pathname?.startsWith('/os');
  
  if (isOSPage) {
    // OS page gets no wrapper - it handles its own full-screen layout
    return <>{children}</>;
  }
  
  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-16 w-full overflow-x-hidden">
        {children}
      </main>
      
      {/* Aura Guide - Floating Chat Assistant */}
      <AuraGuideChat variant="floating" />
    </div>
  );
}
