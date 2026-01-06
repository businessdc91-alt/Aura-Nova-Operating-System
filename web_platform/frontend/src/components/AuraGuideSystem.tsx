/**
 * =============================================================================
 * AURA GUIDE SYSTEM - Persistent AI Assistant with System Control
 * =============================================================================
 *
 * Author: Dillan Copeland (DC)
 * Created: January 6, 2026
 * Last Modified: January 6, 2026 - DC
 * Copyright © 2026 Dillan Copeland. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission
 * from the copyright owner, Dillan Copeland.
 *
 * For licensing inquiries, please contact the owner.
 *
 * =============================================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuraGuideChat } from '@/components/guide/AuraGuideChat';
import toast from 'react-hot-toast';

interface SystemCommand {
  action: 'navigate' | 'open' | 'execute' | 'show' | 'help';
  target?: string;
  params?: Record<string, any>;
}

/**
 * Persistent Aura Guide that appears on all pages with system control capabilities
 */
export function AuraGuideSystem() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  // Listen for custom events to open Aura from anywhere
  useEffect(() => {
    const handleOpenAura = (event: any) => {
      setIsVisible(true);
      if (event.detail?.context) {
        console.log('Opening Aura with context:', event.detail.context);
      }
    };

    window.addEventListener('openAuraGuide', handleOpenAura);
    return () => window.removeEventListener('openAuraGuide', handleOpenAura);
  }, []);

  // Execute system commands from chat
  const executeSystemCommand = (command: SystemCommand) => {
    switch (command.action) {
      case 'navigate':
        if (command.target) {
          router.push(command.target);
          toast.success(`Navigating to ${command.target}`, { icon: '🧭' });
        }
        break;

      case 'open':
        if (command.target) {
          // Handle opening specific apps/features
          const appRoutes: Record<string, string> = {
            dojo: '/dojo',
            'art-studio': '/art-studio',
            'avatar-builder': '/avatar-builder',
            'literature-zone': '/literature-zone',
            constructor: '/constructor',
            'vibe-coding': '/vibe-coding',
            'script-fusion': '/script-fusion',
            chat: '/chat',
            os: '/os',
            catalyst: '/catalyst',
            aetherium: '/suites/aetherium',
            academics: '/suites/academics',
            games: '/suites/games',
          };

          const route = appRoutes[command.target] || `/${command.target}`;
          router.push(route);
          toast.success(`Opening ${command.target.replace('-', ' ')}...`, { icon: '🚀' });
        }
        break;

      case 'execute':
        // Handle specific system actions
        if (command.target === 'export') {
          toast('Please use the export button in the current tool', { icon: '💾' });
        } else if (command.target === 'save') {
          toast('Auto-save is enabled for all tools', { icon: '✅' });
        }
        break;

      case 'show':
        // Show specific UI elements or tutorials
        if (command.target === 'features') {
          router.push('/');
          toast.success('Showing all features', { icon: '✨' });
        } else if (command.target === 'help') {
          setIsVisible(true);
        }
        break;

      default:
        console.log('Unknown command:', command);
    }
  };

  // Parse natural language commands from Aura responses
  useEffect(() => {
    const handleAuraCommand = (event: any) => {
      const message = event.detail?.message?.toLowerCase() || '';

      // Detect navigation intents
      if (message.includes('navigate') || message.includes('go to') || message.includes('open')) {
        const routes = [
          'dojo',
          'art-studio',
          'avatar-builder',
          'literature-zone',
          'constructor',
          'catalyst',
          'aetherium',
          'games',
          'chat',
          'os',
        ];

        for (const route of routes) {
          if (message.includes(route) || message.includes(route.replace('-', ' '))) {
            executeSystemCommand({ action: 'open', target: route });
            break;
          }
        }
      }
    };

    window.addEventListener('auraCommand', handleAuraCommand);
    return () => window.removeEventListener('auraCommand', handleAuraCommand);
  }, [router]);

  // Hide on certain routes if needed
  const hiddenRoutes = [] as string[]; // Add routes where Aura should be hidden
  if (hiddenRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  return (
    <div className="aura-guide-system" style={{ zIndex: 9999, position: 'relative' }}>
      {isVisible && (
        <AuraGuideChat
          variant="floating"
          initialOpen={false}
          currentRoute={pathname}
          userId="user-session" // Replace with actual user ID when auth is added
        />
      )}
    </div>
  );
}

/**
 * Hook to control Aura Guide from any component
 */
export function useAuraGuide() {
  const openAura = (context?: string) => {
    const event = new CustomEvent('openAuraGuide', { detail: { context } });
    window.dispatchEvent(event);
  };

  const sendCommand = (message: string) => {
    const event = new CustomEvent('auraCommand', { detail: { message } });
    window.dispatchEvent(event);
  };

  return { openAura, sendCommand };
}

export default AuraGuideSystem;
