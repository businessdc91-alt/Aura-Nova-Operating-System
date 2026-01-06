/**
 * =============================================================================
 * THE DOJO - Modern AI-Powered Coding Studio
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

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Code2, Users, Sparkles } from 'lucide-react';
import { CatalystDojo } from '@/components/coding-dojo/CatalystDojo';
import { ModernDojoIDE } from '@/components/dojo/ModernDojoIDE';

export default function DojoPage() {
  const [tab, setTab] = useState<'ide' | 'generator' | 'catalyst'>('ide');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-aura-500" />
              The Dojo
            </h1>
            <p className="text-sm text-slate-400">Professional Coding Studio with AI Superpowers</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2">
            <Button
              variant={tab === 'ide' ? 'default' : 'outline'}
              onClick={() => setTab('ide')}
              className={tab === 'ide' ? 'bg-aura-600 hover:bg-aura-700' : ''}
            >
              <Code2 className="w-4 h-4 mr-2" />
              IDE Studio
            </Button>
            <Button
              variant={tab === 'generator' ? 'default' : 'outline'}
              onClick={() => setTab('generator')}
              className={tab === 'generator' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Game Generator
            </Button>
            <Button
              variant={tab === 'catalyst' ? 'default' : 'outline'}
              onClick={() => setTab('catalyst')}
              className={tab === 'catalyst' ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700' : ''}
            >
              <Users className="w-4 h-4 mr-2" />
              Multi-AI Catalyst
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {tab === 'ide' && <ModernDojoIDE />}
      {tab === 'generator' && (
        <div className="p-8 text-center text-slate-400">
          <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Game Generator coming soon!</p>
          <p className="text-sm mt-2">Use the IDE Studio to build games manually, or try Multi-AI Catalyst for collaborative coding.</p>
        </div>
      )}
      {tab === 'catalyst' && <CatalystDojo />}
    </div>
  );
}
