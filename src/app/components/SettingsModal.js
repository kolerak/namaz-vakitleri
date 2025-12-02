import { X, MapPin, Bell, Globe, Navigation, Settings as SettingsIcon, Check, ChevronRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import CitySearch from "./CitySearch";

// isEmbedded prop'unu buraya ekledik ki 'page.js'den gelen bilgiyi alabilelim
export default function SettingsModal({ isOpen, onClose, onAutoLocation, isEmbedded }) {
  const {
    language, setLanguage, setCity, setCoords, t,
    notificationsEnabled, setNotificationsEnabled
  } = useSettings();

  if (!isOpen) return null;

  const handleCitySelect = (selectedData) => {
    setCity(selectedData.name);
    setCoords({ lat: parseFloat(selectedData.lat), lng: parseFloat(selectedData.lng) });
  };

  const toggleNotifications = async () => {
    // 1. Zaten açıksa kapat (Her yerde aynı)
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }

    // 2. Eklenti (iframe) içindeysek direkt AÇ
    // İzin sormaya gerek yok, background.js hallediyor.
    if (isEmbedded) {
      setNotificationsEnabled(true);
      return;
    }

    // 3. Normal Web Sitesi ise izin iste (Eski kodun aynısı)
    if (!("Notification" in window)) { 
      alert(t.browserNoNotif); 
      return; 
    }
    
    try {
      const p = await Notification.requestPermission();
      if (p === "granted") {
        setNotificationsEnabled(true);
        try { 
          new Notification(t.testTitle, { body: t.testBody, icon: "/icon.png", silent: true }); 
        } catch {}
      } else {
        alert(t.permissionDenied);
        setNotificationsEnabled(false);
      }
    } catch (e) {
      console.error("Bildirim izni hatası:", e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container: max-w-md ile biraz daha genişletildi */}
      <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        {/* --- Header --- */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
            <SettingsIcon size={20} className="text-yellow-500" />
            {t.settings}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-zinc-400 hover:text-white bg-transparent hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="p-6 space-y-8 overflow-y-auto scrollbar-thin">
          
          {/* Bölüm 1: Konum */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> {t.location}
              </label>
            </div>
            
            <div className="relative z-50">
              <CitySearch onSelectCity={handleCitySelect} />
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] text-zinc-600 uppercase tracking-wider">{t.or}</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              onClick={() => { onAutoLocation(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 hover:border-blue-600/30 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <Navigation size={16} />
              {t.autoLocation}
            </button>
          </section>

          {/* Bölüm 2: Tercihler */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} /> {t.language} & {t.notifications}
            </label>

            <div className="space-y-3">
              {/* Dil Seçimi */}
              <div className="grid grid-cols-3 gap-2">
                {['tr', 'en', 'ar'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`relative py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 ${
                      language === lang
                        ? "bg-white text-black border-white shadow-lg scale-[1.02]"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Bildirim Switch (iOS Style) */}
              <button
                onClick={toggleNotifications}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  notificationsEnabled
                    ? "bg-emerald-950/30 border-emerald-500/30"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${notificationsEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Bell size={18} className={notificationsEnabled ? 'fill-current' : ''} />
                  </div>
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${notificationsEnabled ? 'text-emerald-200' : 'text-zinc-400'}`}>
                      {t.notifications}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {notificationsEnabled ? t.notifOn : t.notifOff}
                    </span>
                  </div>
                </div>

                {/* Switch Graphic */}
                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? "bg-emerald-500" : "bg-zinc-700"}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 flex items-center justify-center ${notificationsEnabled ? "left-[26px]" : "left-1"}`}>
                    {notificationsEnabled && <Check size={12} className="text-emerald-600 stroke-[4]" />}
                  </div>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* --- Footer --- */}
        <div className="p-4 bg-black/20 text-center border-t border-white/5 backdrop-blur-sm">
          <p className="text-[10px] text-zinc-600 font-medium">
            {t.modalDesc}
          </p>
        </div>

      </div>
    </div>
  );
}