'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import {
  Monitor,
  ShoppingCart,
  Info,
  Globe,
  ArrowRight,
  Zap,
  Cpu,
  Cog,
  Codesandbox,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION: THE OVERVIEW */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero_overview.png" 
            alt="Aura Nova City Overview" 
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 mt-20">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 mb-6 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
              AURA NOVA
            </h1>
            <p className="text-2xl md:text-3xl text-cyan-100 font-light mb-8 max-w-3xl mx-auto text-shadow">
              Where Ancient Alchemy Meets Artificial Intelligence.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                href="/os"
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-full font-bold text-lg transition transform hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center border border-cyan-400/30"
              >
                <Monitor className="mr-2" /> Enter System
              </Link>
              <a 
                href="https://AuraxNovaOS.online"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-black/60 backdrop-blur-md hover:bg-white/10 rounded-full font-bold text-lg transition border border-white/20 flex items-center"
              >
                <Globe className="mr-2 text-purple-400" /> AuraxNovaOS.online
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <span className="text-white/50 text-sm tracking-widest uppercase">Explore the City</span>
        </div>
      </section>

      {/* 2. DOMAIN HUB (PORTAL) */}
      <section className="relative z-20 -mt-20 px-4 max-w-7xl mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a href="https://auraxnova.store" target="_blank" className="group">
            <Card className="bg-black/80 backdrop-blur border-amber-500/30 hover:border-amber-400 transition-all p-6 text-center group-hover:bg-amber-900/20">
              <ShoppingCart className="w-8 h-8 mx-auto text-amber-400 mb-2 group-hover:scale-110 transition" />
              <h3 className="text-amber-100 font-bold">.STORE</h3>
              <p className="text-xs text-amber-400/60">Official Merchandise</p>
            </Card>
          </a>
          <a href="https://auraxnova.website" target="_blank" className="group">
            <Card className="bg-black/80 backdrop-blur border-purple-500/30 hover:border-purple-400 transition-all p-6 text-center group-hover:bg-purple-900/20">
              <Sparkles className="w-8 h-8 mx-auto text-purple-400 mb-2 group-hover:scale-110 transition" />
              <h3 className="text-purple-100 font-bold">.WEBSITE</h3>
              <p className="text-xs text-purple-400/60">Web Portal</p>
            </Card>
          </a>
          <a href="https://auraxnova.info" target="_blank" className="group">
            <Card className="bg-black/80 backdrop-blur border-cyan-500/30 hover:border-cyan-400 transition-all p-6 text-center group-hover:bg-cyan-900/20">
              <Info className="w-8 h-8 mx-auto text-cyan-400 mb-2 group-hover:scale-110 transition" />
              <h3 className="text-cyan-100 font-bold">.INFO</h3>
              <p className="text-xs text-cyan-400/60">Documentation</p>
            </Card>
          </a>
          <a href="/os" className="group">
            <Card className="bg-black/80 backdrop-blur border-green-500/30 hover:border-green-400 transition-all p-6 text-center group-hover:bg-green-900/20">
              <Cpu className="w-8 h-8 mx-auto text-green-400 mb-2 group-hover:scale-110 transition" />
              <h3 className="text-green-100 font-bold">OS</h3>
              <p className="text-xs text-green-400/60">Launch Application</p>
            </Card>
          </a>
        </div>
      </section>

      {/* 3. THE CENTER: FUTURISTIC UTOPIA */}
      <section className="relative min-h-[80vh] flex items-center py-20">
        <div className="absolute inset-0 z-0">
           <Image 
            src="/town_center.png" 
            alt="Aura Nova Town Center" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 rounded-full border border-cyan-500/50 bg-cyan-900/30 text-cyan-300 text-sm font-tracking-wider">
              SECTOR 1: THE CORE
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Hyper-Modern <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Cognitive Architecture
              </span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              In the heart of Aura Nova, advanced AI algorithms govern a seamless digital society. 
              Here, the <span className="text-cyan-400">Gemini 3.0 Pro</span> neural network processes 
              reality in real-time, offering creators unlimited potential.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 backdrop-blur">
                 <Monitor className="text-cyan-400 mb-2" />
                 <h3 className="text-white font-bold">OS Shell</h3>
                 <p className="text-slate-400 text-sm">Full desktop environment in browser.</p>
               </div>
               <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 backdrop-blur">
                 <Zap className="text-blue-400 mb-2" />
                 <h3 className="text-white font-bold">Instant Deploy</h3>
                 <p className="text-slate-400 text-sm">From code to live in seconds.</p>
               </div>
            </div>

            <Link href="/os" className="inline-flex items-center text-cyan-400 font-bold hover:text-cyan-300 transition">
              Explore the Core <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. THE OUTSKIRTS: DIGITAL ALCHEMY */}
      <section className="relative min-h-[80vh] flex items-center py-20 justify-end text-right">
        <div className="absolute inset-0 z-0">
           <Image 
            src="/outskirts.png" 
            alt="Aura Nova Outskirts" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2">
          <div className="md:col-start-2 space-y-8 flex flex-col items-end">
            <div className="inline-block px-4 py-1 rounded-full border border-amber-500/50 bg-amber-900/30 text-amber-300 text-sm font-tracking-wider">
              SECTOR 9: THE FOUNDRY
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Forged in <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-500">
                Steam & Silicon
              </span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Where the old world meets the new code. The outskirts are home to the builders, 
              the tinkerers, and the <span className="text-amber-400">Mecha-Constructs</span>. 
              Use raw tools to forge new games, scripts, and art.
            </p>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
               <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 backdrop-blur text-right">
                 <Cog className="text-amber-400 mb-2 ml-auto" />
                 <h3 className="text-white font-bold">The Dojo</h3>
                 <p className="text-slate-400 text-sm">Train your game dev skills.</p>
               </div>
               <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 backdrop-blur text-right">
                 <Codesandbox className="text-orange-400 mb-2 ml-auto" />
                 <h3 className="text-white font-bold">Constructors</h3>
                 <p className="text-slate-400 text-sm">Build components piece by piece.</p>
               </div>
            </div>

            <Link href="/dojo" className="inline-flex items-center text-amber-400 font-bold hover:text-amber-300 transition">
              Enter the Foundry <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-12 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-black text-white mb-4">AURA NOVA STUDIOS</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            The Operating System for the Creative Singularity.
          </p>
          <div className="flex justify-center gap-6 text-slate-400 text-sm">
            <Link href="/os" className="hover:text-white transition">System</Link>
            <Link href="/social" className="hover:text-white transition">Network</Link>
            <a href="https://auraxnova.store" target="_blank" className="hover:text-white transition">Store</a>
            <a href="https://console.firebase.google.com/project/auraxnovaos/firestore" target="_blank" className="hover:text-aura-400 transition text-slate-600">Cloud DB</a>
          </div>
          <div className="mt-8 text-xs text-slate-600">
            © 2026 Aura Nova Studios. Powered by Gemini 3.0 Pro.
          </div>
        </div>
      </footer>
    </div>
  );
}
