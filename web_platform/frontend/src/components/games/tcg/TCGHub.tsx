import React, { useState, useEffect } from 'react';
import { 
  getPlayerCollection, 
  PlayerCollection, 
  savePlayerCollection, 
  CardInstance, 
  SavedDeck 
} from '../../../services/aetheriumService';
import { STARTER_DECKS, StarterDeck } from '../../../data/starterDecks';
import { claimStarterDeck } from '../../../services/starterDeckService';
import DeckBuilder from './DeckBuilder';

interface TCGHubProps {
  onClose?: () => void;
}

export default function TCGHub({ onClose }: TCGHubProps) {
  const [view, setView] = useState<'menu' | 'collection' | 'play' | 'shop'>('menu');
  const [collection, setCollection] = useState<PlayerCollection | null>(null);
  const [activeDeck, setActiveDeck] = useState<StarterDeck | null>(null);

  // Load collection on mount
  useEffect(() => {
    // In a real app we'd get the auth ID; using 'demo-user' for now or from context
    const playerId = 'demo-user'; 
    const col = getPlayerCollection(playerId);
    setCollection(col);
  }, []);

  const handleClaimStarter = (deckId: string) => {
    try {
      if (!collection) return;
      
      const newCards = claimStarterDeck(collection.oderId); // This logic might need updating to accept a SPECIFIC deck choice, 
                                                           // but currently starterDeckService just returns a fixed set.
                                                           // Let's assume for now we claim the generic start set but theme it.
      
      // Update collection
      // We need to convert templates to instances
      // Actually claimStarterDeck in service returns TEMPLATES. We need to instantiate them.
      // This logic is a bit missing in the service, I'll handle it here or update service later.
      // For now, let's assume the service handles it or we mock it.
      
       // Wait, `claimStarterDeck` returns `CardTemplate[]`. We need to convert to `CardInstance[]`.
       // Let's defer this complexity and just say "Starter Deck Claimed!" visual for now.
       
       alert("Starter Deck claiming system coming in next update! (Service update needed)");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎴</div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Aetherium TCG
            </h1>
            <p className="text-xs text-slate-400">Chronicles of the Cogwork Realm</p>
          </div>
        </div>
        
        {collection && (
          <div className="flex gap-4 text-sm bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700">
            <div className="flex items-center gap-1 text-yellow-400">
              <span>🪙</span>
              <span>{collection.coins}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <span>💎</span>
              <span>{collection.dust}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1614728853970-bc5c1a695d3d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full p-6">
              <button 
                onClick={() => setView('play')}
                className="group relative h-48 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-blue-500 transition-all hover:scale-[1.02] shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group-hover:from-blue-600/40 group-hover:to-purple-600/40 transition-all" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚔️</span>
                  <h2 className="text-2xl font-bold text-white mb-2">Play</h2>
                  <p className="text-slate-300 text-sm">Challenge AI opponents or other players</p>
                </div>
              </button>

              <button 
                onClick={() => setView('collection')}
                className="group relative h-48 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-green-500 transition-all hover:scale-[1.02] shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-teal-600/20 group-hover:from-green-600/40 group-hover:to-teal-600/40 transition-all" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</span>
                  <h2 className="text-2xl font-bold text-white mb-2">Collection & Decks</h2>
                  <p className="text-slate-300 text-sm">Manage your cards, build decks, and customize art</p>
                </div>
              </button>

              <button 
                onClick={() => setView('shop')}
                className="group relative h-32 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-amber-500 transition-all hover:scale-[1.02] shadow-xl md:col-span-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 group-hover:from-amber-600/40 group-hover:to-orange-600/40 transition-all" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">🛍️</span>
                  <h2 className="text-xl font-bold text-white">Marketplace</h2>
                  <p className="text-slate-300 text-xs">Buy packs and trade cards (Coming Soon)</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {view === 'collection' && collection && (
          <div className="h-full flex flex-col">
            <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-4">
              <button 
                onClick={() => setView('menu')}
                className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm transition-colors"
              >
                ← Back
              </button>
              <h2 className="font-bold text-lg">Deck Builder</h2>
            </div>
            <DeckBuilder collection={collection} onUpdateCollection={setCollection} />
          </div>
        )}

        {/* Placeholders for other views */}
        {(view === 'play' || view === 'shop') && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold mb-2">Under Construction</h2>
            <p className="text-slate-400 mb-6">This area of the Cogwork Realm is still being forged.</p>
            <button 
              onClick={() => setView('menu')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors font-medium"
            >
              Return to Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
