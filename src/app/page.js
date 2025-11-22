"use client";


import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Settings, MapPin, RefreshCw, Camera } from "lucide-react";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import PrayerGrid from "./components/PrayerGrid";
import SettingsModal from "./components/SettingsModal";
import { PRAYER_NAMES_ORDER, BACKGROUND_IMAGES as DEFAULT_BACKGROUNDS } from "./utils/constants";
import { getCityImage } from "./utils/imageService"; //,

function AppContent() {
  const { city, setCity, setCoords, coords, t, notificationsEnabled, isLoading, language } = useSettings();
  
  const [times, setTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [bgImage, setBgImage] = useState(DEFAULT_BACKGROUNDS[0]);
  const [photoCredit, setPhotoCredit] = useState({ author: "", source: "" });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastNotifiedTime, setLastNotifiedTime] = useState(null); 

  useEffect(() => { if (city && t) document.title = `${city} - ${t.prayerTimes}`; }, [city, t]);

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading || !city) return;
      try {
        let url = coords 
          ? `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=13`
          : `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Turkey&method=13`;
        
        const res = await axios.get(url);
        setTimes(res.data.data.timings);
        
        const imageData = await getCityImage(city);
        setBgImage(imageData.url);
        setPhotoCredit({ author: imageData.author || "Bilinmiyor", source: imageData.source });
      } catch (error) { console.error("Veri hatası:", error); }
    };
    fetchData();
  }, [city, coords, isLoading]); 

  useEffect(() => {
    if (!times) return;
    const runTimer = () => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      
      if (notificationsEnabled) {
        const currentPrayerName = PRAYER_NAMES_ORDER.find(name => times[name] === currentTimeStr);
        if (currentPrayerName && lastNotifiedTime !== currentTimeStr) {
          if (Notification.permission === "granted") {
             const prayerName = getTranslatedName(currentPrayerName);
             let title = language === 'en' ? `Time for ${prayerName}` : `Vakit Geldi: ${prayerName}`;
             let body = language === 'en' ? `Prayer time for ${city}.` : `${city} için ${prayerName} vakti girdi.`;
             new Notification(title, { body: body, icon: "/icon.png", silent: true });
             const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
             audio.volume = 0.5; audio.play().catch(e => {});
          }
          setLastNotifiedTime(currentTimeStr);
        }
      }

      let targetTime = null, targetName = "";
      if (selectedPrayer) {
        targetName = selectedPrayer;
        const [h, m] = times[selectedPrayer].split(":").map(Number);
        targetTime = new Date(); targetTime.setHours(h, m, 0);
        if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);
      } else {
        for (let name of PRAYER_NAMES_ORDER) {
          const [h, m] = times[name].split(":").map(Number);
          const prayerTime = new Date(); prayerTime.setHours(h, m, 0);
          if (prayerTime > now) { targetTime = prayerTime; targetName = name; break; }
        }
        if (!targetTime) {
          const [h, m] = times["Fajr"].split(":").map(Number);
          targetTime = new Date(); targetTime.setDate(targetTime.getDate() + 1); targetTime.setHours(h, m, 0); targetName = "Fajr";
        }
        setNextPrayer(targetName);
      }
      const diff = targetTime - now;
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${h}sa ${m}dk ${s}sn`);
    };
    runTimer();
    const interval = setInterval(runTimer, 1000);
    return () => clearInterval(interval);
  }, [times, selectedPrayer, notificationsEnabled, lastNotifiedTime, language, city]);

  const handleAutoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude; const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
           const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language}`);
           if(res.data && res.data.address) {
              const detectedCity = res.data.address.town || res.data.address.city || res.data.address.province || "Konum";
              setCity(detectedCity);
           }
        } catch (e) { setCity("Konum"); }
        setIsSettingsOpen(false);
      });
    }
  };

  const getTranslatedName = (name) => t[name?.toLowerCase()] || name;

  if (isLoading) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </main>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 z-0">
        <Image src={bgImage} alt={`${city}`} fill priority className="object-cover object-center transition-all duration-1000 transform scale-105" quality={75} />
      </div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 bg-black/30 p-1.5 px-3 rounded-full backdrop-blur-md border border-white/10">
          <MapPin size={16} className="text-yellow-400"/><span className="font-semibold tracking-wide text-sm">{city.toUpperCase()}</span>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} aria-label="Ayarlar" className="p-2 bg-black/30 rounded-full hover:bg-white/20 transition backdrop-blur-md border border-white/10"><Settings size={20} /></button>
      </div>

      <div className="z-10 text-center flex flex-col items-center w-full px-4 mt-4">
        <div className="mb-6 flex flex-col items-center">
          <p className="text-xs md:text-sm font-light opacity-90 mb-1 uppercase tracking-widest text-blue-200">
             {selectedPrayer ? `${getTranslatedName(selectedPrayer)} ${t.remainingTime}` : t.remainingTime}
          </p>
          <h1 className="text-6xl md:text-8xl font-bold tabular-nums tracking-tighter drop-shadow-2xl leading-tight">{countdown || "00:00:00"}</h1>
          <div className="mt-4 flex flex-col items-center gap-2 justify-center">
             <div className="bg-white/10 backdrop-blur-md py-1.5 px-5 rounded-full inline-block border border-white/10 shadow-lg">
                <span className="text-base font-medium">{selectedPrayer ? t.nextPrayer + " (Seçili)" : t.nextPrayer}: <span className="font-bold text-yellow-300">{getTranslatedName(selectedPrayer || nextPrayer)}</span></span>
             </div>
             {selectedPrayer && (<button onClick={() => setSelectedPrayer(null)} className="text-xs flex items-center gap-1 text-gray-300 hover:text-white bg-black/40 px-3 py-1 rounded-full transition hover:bg-red-500/80"><RefreshCw size={10} /> Otomatiğe Dön</button>)}
          </div>
        </div>
        {times && <PrayerGrid times={times} nextPrayer={nextPrayer} selectedPrayer={selectedPrayer} onSelectPrayer={setSelectedPrayer} t={t} />}
      </div>
<div className="absolute bottom-3 left-0 w-full flex justify-center items-center gap-3 z-20 text-[10px] md:text-xs text-white/60 font-light tracking-wide">
        <span>&copy; {new Date().getFullYear()} Namaz Vakti</span>
        <span className="w-1 h-1 bg-white/40 rounded-full"></span>
        <Link 
          href="/privacy-policy" 
          className="hover:text-white hover:underline underline-offset-2 transition-all"
        >
          {language === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
        </Link>
      </div>
      <div className="absolute bottom-2 right-3 z-20 flex flex-col items-end gap-1">
        <div className="group flex items-center gap-1.5 px-2.5 py-1 bg-black/20 hover:bg-black/60 backdrop-blur-sm border border-white/5 rounded-full text-[10px] text-white/60 hover:text-white transition-all duration-300 cursor-default">
           <Camera size={12} /><span className="max-w-[100px] truncate font-light tracking-wide">{photoCredit.author}</span>
        </div>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onAutoLocation={handleAutoLocation} />
    </main>
  );
}

export default function Home() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}