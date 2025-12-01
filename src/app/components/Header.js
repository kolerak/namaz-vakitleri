import { Settings, MapPin, ChevronRight, Crosshair } from "lucide-react";

export default function Header({ city, onOpenSettings, t, isEmbedded }) {
  
  // Stil Tanımları (CSS dosyasına gerek kalmadan her şey burada)
  const s = {
    layout: isEmbedded ? "px-4 pt-4" : "px-8 pt-8",
    
    // 👇 İŞTE SİHİRLİ KISIM (CSS Dosyası Gerekmez)
    // Tailwind'in özel [...] sözdizimini kullanarak o premium efekti buraya gömdük.
    glass: `
      bg-[#0a0a0a]/60 
      backdrop-blur-[20px] backdrop-saturate-[180%] 
      border border-white/[0.08]
      shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5),_inset_0_1px_0_0_rgba(255,255,255,0.15)]
      hover:bg-[#1a1a1a]/70 
      hover:border-white/[0.2]
      hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6),_inset_0_1px_0_0_rgba(255,255,255,0.3)]
    `,
    
    pillHeight: isEmbedded ? "h-10" : "h-12 md:h-14",
    labelText: isEmbedded ? "text-[9px]" : "text-[10px]",
    mainText: isEmbedded ? "text-xs" : "text-sm md:text-base",
    iconMain: isEmbedded ? 14 : 18,
    iconSmall: isEmbedded ? 12 : 14,
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full ${s.layout} flex justify-between items-start pointer-events-none animate-in fade-in duration-1000`}
    >
      
      {/* --- SOL: KONUM GÖSTERGESİ --- */}
      <button
        onClick={onOpenSettings}
        className={`
          group pointer-events-auto 
          relative flex items-center gap-4 pl-1.5 pr-6 ${s.pillHeight}
          rounded-full 
          ${s.glass}  /* <-- YENİ EFEKT */
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          hover:scale-[1.02]
          active:scale-95
        `}
      >
        {/* İkon Kapsülu */}
        <div className={`
          flex items-center justify-center aspect-square h-[80%] rounded-full my-auto
          bg-white/[0.05] border border-white/[0.05]
          group-hover:bg-yellow-500/20 group-hover:text-yellow-400 group-hover:border-yellow-500/30
          transition-all duration-500
        `}>
          <div className="relative w-full h-full flex items-center justify-center">
            <MapPin 
              size={s.iconMain} 
              className="absolute transition-all duration-500 rotate-0 scale-100 opacity-100 group-hover:rotate-90 group-hover:scale-0 group-hover:opacity-0 text-white/80" 
            />
            <Crosshair 
              size={s.iconMain} 
              className="absolute transition-all duration-500 -rotate-90 scale-0 opacity-0 group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 text-yellow-400" 
            />
          </div>
        </div>

        {/* Metin Alanı */}
        <div className="flex flex-col items-start justify-center h-full py-1">
          <span className={`${s.labelText} font-mono text-white/40 leading-none uppercase tracking-widest mb-1 group-hover:text-yellow-500/60 transition-colors`}>
            {t?.currentLocationLabel || "LOCATION"}
          </span>
          
          <div className="flex items-center gap-2.5">
            <span className={`font-bold ${s.mainText} text-white tracking-[0.2em] uppercase leading-none drop-shadow-md`}>
              {city || "UNKNOWN"}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            </span>
          </div>
        </div>

        <ChevronRight 
          size={s.iconSmall} 
          className="text-white/50 absolute right-3 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />
      </button>


      {/* --- SAĞ: AYARLAR --- */}
      <button
        onClick={onOpenSettings}
        aria-label={t?.settings || "Ayarlar"}
        className={`
          group pointer-events-auto 
          relative flex items-center justify-center aspect-square ${s.pillHeight}
          rounded-full 
          ${s.glass} /* <-- YENİ EFEKT */
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          hover:rotate-90
        `}
      >
        <Settings 
          size={s.iconMain + 4} 
          strokeWidth={1.5}
          className="text-white/80 group-hover:text-white transition-colors duration-500"
        />
        
        {/* İnce bir parlama detayı (Settings için) */}
        <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-white/20 transition-colors duration-500" />
      </button>

    </header>
  );
}