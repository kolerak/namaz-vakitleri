import { RefreshCw } from "lucide-react";
import { useSettings } from "../context/SettingsContext"; // Context'i import ettik

export default function MainCountdown({ countdown, selectedPrayer, nextPrayer, getTranslatedName, onResetSelection, isEmbedded }) {
  
  // Dil verilerini artık doğrudan buradan çekiyoruz (Prop olarak almaya gerek yok)
  const { t, language } = useSettings();

  return (
    <div className={isEmbedded ? "mb-4" : "mb-6"}>
      <p className="text-[10px] md:text-sm font-light opacity-90 mb-1 uppercase tracking-widest text-blue-200">
        {selectedPrayer
          ? (language === "en"
              ? `${t.remainingTime} for ${getTranslatedName(selectedPrayer)}`
              : `${getTranslatedName(selectedPrayer)} ${t.remainingTime}`
            )
          : t.remainingTime}
      </p>

      <h1 className={[
          "font-[5] tabular-nums tracking-tighter drop-shadow-xl leading-tight",
          isEmbedded ? "text-5xl" : "text-6xl md:text-8xl",
        ].join(" ")}
      >
        {/* Context'ten gelen varsayılan sayaç formatı */}
        {countdown || t.defaultCountdown}
      </h1>

      <div className="mt-3 flex flex-col items-center gap-2">
        <div className="bg-white/10 backdrop-blur-md py-1 px-4 rounded-full inline-block border border-white/10 shadow-lg">
          <span className={isEmbedded ? "text-sm" : "text-base"}>
            {/* "Seçili" ibaresini Context'ten aldık */}
            {selectedPrayer ? `${t.nextPrayer} ${t.selectedSuffix}` : t.nextPrayer}:{" "}
            <span className="font-bold text-yellow-300">
              {getTranslatedName(selectedPrayer || nextPrayer)}
            </span>
          </span>
        </div>

        {selectedPrayer && (
          <button
            onClick={onResetSelection}
            className="text-[11px] flex items-center gap-1 text-gray-200 hover:text-white bg-black/40 px-3 py-1 rounded-full transition hover:bg-red-500/80"
          >
            <RefreshCw size={10} />
            {/* Buton metnini Context'ten aldık */}
            {t.backToAuto}
          </button>
        )}
      </div>
    </div>
  );
}