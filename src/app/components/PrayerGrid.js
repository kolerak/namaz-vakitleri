import React from "react";
import { PRAYER_NAMES_ORDER } from "../utils/constants";

const PrayerGrid = ({ times, nextPrayer, selectedPrayer, onSelectPrayer, t }) => {
  const getTranslatedName = (apiName) =>
    t[apiName.toLowerCase()] || apiName;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8 w-full max-w-5xl px-4">
      {PRAYER_NAMES_ORDER.map((p) => {
        const isActive = selectedPrayer ? selectedPrayer === p : nextPrayer === p;

        return (
          <button
            key={p}
            onClick={() => onSelectPrayer(p)}
            className={`
              flex flex-col items-center justify-center rounded-4xl px-4 py-3
              backdrop-blur-xl border cursor-pointer transition-all duration-300 group select-none
              ${
                isActive
                  ? "bg-yellow-400/20 border-yellow-300/40 shadow-[0_0_20px_rgba(255,223,0,0.35)] scale-110"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-105"
              }
            `}
          >
            {/* Name */}
            <span
              className={`text-[0.7rem] uppercase tracking-wider mb-1 transition-colors
                ${isActive ? "text-yellow-200" : "text-gray-300 group-hover:text-white"}
              `}
            >
              {getTranslatedName(p)}
            </span>

            {/* Time */}
            <span
              className="text-xl font-semibold font-mono tracking-tight transition-transform duration-300 group-hover:scale-110"
            >
              {times[p]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PrayerGrid;
