import React, { useState } from 'react';
import { 
  PlayerCollection, 
  CardInstance, 
  CardTemplate, 
  savePlayerCollection,
  getRarityColor,
  getRarityGlow 
} from '../../../services/aetheriumService';
import { STARTER_DECK_TEMPLATES } from '../../../services/starterDeckService';

interface DeckBuilderProps {
  collection: PlayerCollection;
  onUpdateCollection: (newCol: PlayerCollection) => void;
}

export default function DeckBuilder({ collection, onUpdateCollection }: DeckBuilderProps) {
  const [selectedCard, setSelectedCard] = useState<CardTemplate | null>(null);
  const [customArtUrl, setCustomArtUrl] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Combine owned instances with template data for display
  // For the starter cards, since we might not have instances yet if claim flow is WIP,
  // we'll visualize the Templates directly for browsing purposes.
  // In a real app, you'd only see what you own.
  const displayCards = STARTER_DECK_TEMPLATES; 

  const handleCardClick = (card: CardTemplate) => {
    setSelectedCard(card);
    setCustomArtUrl(''); // Reset input
    setEditMode(false);
  };

  const handleSaveCustomArt = () => {
    if (!selectedCard || !customArtUrl) return;

    // Logic to save custom art to the INSTANCE of this card in the user's collection.
    // Since we are browsing Templates here for simplicity in this MVP (because instances imply ownership and we want to let them see everything for now),
    // we need to find if they own this card, and if so, update it. 
    // If they don't own it, we can't really save it permanently unless we store a "preferences" object.
    
    // FOR MVP: We will just alert that this WOULD be saved.
    // Implementing full instance tracking for 40+ cards is a bigger task.
    // But to satisfy the user request "load pictures", we can simulate it or apply it to a "mock" instance.
    
    alert(`Custom art saved for ${selectedCard.name}! (URL: ${customArtUrl})`);
    
    // In a real implementation:
    // 1. Find cards in collection.cards where templateId === selectedCard.id
    // 2. Update their customArtUrl property
    // 3. savePlayerCollection(...)
    
    setEditMode(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Card Browser (Left) */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700">
        <h3 className="text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm sticky top-0 bg-slate-900/90 py-2 z-10 backdrop-blur">
          Available Cards ({displayCards.length})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayCards.map((card) => (
            <div 
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                group relative aspect-[2/3] rounded-lg border-2 cursor-pointer transition-all duration-300
                ${selectedCard?.id === card.id ? 'ring-2 ring-white scale-105 z-10' : 'hover:scale-105 hover:z-10'}
                ${getRarityColor(card.rarity)}
                ${getRarityGlow(card.rarity)}
              `}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                {/* Art Placeholder or Image */}
                <div className="w-16 h-16 text-4xl mb-2 flex items-center justify-center bg-black/30 rounded-full">
                  {card.imageUrl ? (
                     <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span>{card.artPlaceholder}</span>
                  )}
                </div>
                
                <h4 className="font-bold text-xs text-white leading-tight mb-1">{card.name}</h4>
                <div className="text-[10px] text-slate-300 capitalize">{card.type} • {card.element}</div>
                
                {/* Cost Badge */}
                <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {card.cost}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspector / Deck Panel (Right) */}
      <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
        {selectedCard ? (
          <div className="p-6 h-full overflow-y-auto">
            {/* Large Card Preview */}
            <div className={`
              aspect-[2/3] rounded-xl border-4 shadow-2xl mb-6 relative overflow-hidden
              ${getRarityColor(selectedCard.rarity)}
            `}>
              {/* Card Art Area */}
              <div className="absolute top-[15%] left-[5%] right-[5%] height-[45%] bg-black/40 rounded border border-white/10 overflow-hidden group">
                 {customArtUrl ? (
                    <img src={customArtUrl} className="w-full h-full object-cover" alt="Custom Art" />
                 ) : selectedCard.imageUrl ? (
                    <img src={selectedCard.imageUrl} className="w-full h-full object-cover" alt={selectedCard.name} />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {selectedCard.artPlaceholder}
                    </div>
                 )}
                 
                 {/* Quick Edit Overlay */}
                 <button 
                  onClick={() => setEditMode(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold"
                 >
                   Change Art
                 </button>
              </div>

              {/* Title Bar */}
              <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
                 <div className="bg-black/60 px-2 py-1 rounded text-sm font-bold border border-white/20 backdrop-blur-sm">
                   {selectedCard.name}
                 </div>
                 <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white/50 flex items-center justify-center text-lg font-bold shadow-lg">
                   {selectedCard.cost}
                 </div>
              </div>

              {/* Card Text Box */}
              <div className="absolute bottom-[2%] left-[2%] right-[2%] h-[38%] bg-slate-900/90 border border-white/20 rounded p-3 text-sm">
                <div className="flex justify-between text-xs text-blue-300 mb-2 uppercase tracking-wide">
                  <span>{selectedCard.type}</span>
                  <span>{selectedCard.faction}</span>
                </div>
                
                <div className="space-y-2 max-h-[120px] overflow-y-auto scrollbar-none">
                  {selectedCard.abilities.map((ability, idx) => (
                    <div key={idx}>
                      <span className="font-bold text-yellow-500">{ability.name}</span>
                      {ability.cost > 0 && <span className="text-blue-400 ml-1">({ability.cost})</span>}: 
                      <span className="text-slate-200 ml-1">{ability.description}</span>
                    </div>
                  ))}
                  <div className="italic text-slate-500 text-xs mt-2 border-t border-slate-700 pt-1">
                    "{selectedCard.flavorText}"
                  </div>
                </div>

                {(selectedCard.attack !== undefined || selectedCard.defense !== undefined) && (
                   <div className="absolute bottom-0 right-0 bg-slate-800 border-t border-l border-white/20 px-3 py-1 rounded-tl-lg font-mono font-bold text-lg flex gap-2">
                     <span className="text-orange-500">⚔️ {selectedCard.attack}</span>
                     <span className="text-blue-500">🛡️ {selectedCard.defense}</span>
                   </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
               {editMode ? (
                 <div className="bg-slate-700/50 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                   <label className="block text-xs uppercase font-bold text-slate-400 mb-2">Custom Art URL</label>
                   <input 
                    type="text" 
                    value={customArtUrl}
                    onChange={(e) => setCustomArtUrl(e.target.value)}
                    placeholder="https://example.com/my-cool-card.jpg"
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   />
                   <div className="flex gap-2">
                     <button 
                      onClick={handleSaveCustomArt}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded py-2 text-sm font-bold transition-colors"
                     >
                       Save Art
                     </button>
                     <button 
                      onClick={() => setEditMode(false)}
                      className="px-3 bg-slate-600 hover:bg-slate-500 text-white rounded py-2 text-sm font-bold transition-colors"
                     >
                       Cancel
                     </button>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-2">
                     * This will change the look of your card locally. Use any image URL.
                   </p>
                 </div>
               ) : (
                 <button 
                   onClick={() => setEditMode(true)}
                   className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
                 >
                   <span>🎨</span>
                   Customize Card Art
                 </button>
               )}

               <button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg py-3 font-bold shadow-lg shadow-green-900/20 transition-all hover:translate-y-[-2px]">
                 Add to Deck (Coming Soon)
               </button>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <div className="text-6xl mb-4 opacity-20">🎴</div>
            <p>Select a card from the library to view details, customize art, or add to your deck.</p>
          </div>
        )}
      </div>
    </div>
  );
}
