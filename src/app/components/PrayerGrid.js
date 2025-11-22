import React from 'react';
import { PRAYER_NAMES_ORDER } from '../utils/constants';

const PrayerGrid = ({ times, nextPrayer, selectedPrayer, onSelectPrayer, t }) => {
  const getTranslatedName = (apiName) => {
    return t[apiName.toLowerCase()] || apiName;
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mt-8 w-full max-w-4xl px-4">
      {PRAYER_NAMES_ORDER.map((p) => {
        // Hangi kutu aktif? (Seçili olan varsa o, yoksa sıradaki vakit)
        const isActive = selectedPrayer ? selectedPrayer === p : nextPrayer === p;
        
        return (
          <button 
            key={p}
            onClick={() => onSelectPrayer(p)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl backdrop-blur-md border transition-all cursor-pointer group
              ${isActive 
                ? 'bg-yellow-500/30 scale-110 border-yellow-400/50 shadow-lg shadow-yellow-500/20' 
                : 'bg-black/40 border-white/10 hover:bg-black/50 hover:border-white/30'
              }`}
          >
            <span className={`text-xs uppercase tracking-wider mb-1 transition-colors ${isActive ? 'text-yellow-200' : 'text-gray-300'}`}>
              {getTranslatedName(p)}
            </span>
            <span className="text-lg font-bold font-mono group-hover:scale-105 transition-transform">
              {times[p]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PrayerGrid;