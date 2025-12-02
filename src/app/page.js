"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Context
import { SettingsProvider, useSettings } from "./context/SettingsContext";

// Components
import PrayerGrid from "./components/PrayerGrid";
import SettingsModal from "./components/SettingsModal";
import Header from "./components/Header";
import Background from "./components/Background";
import MainCountdown from "./components/MainCountdown";

// Hooks
import { usePrayerData } from "./hooks/usePrayerData";
import { usePrayerTimer } from "./hooks/usePrayerTimer";

function AppContent() {
  const {
    city,
    setCity,
    setCoords,
    coords,
    t,
    notificationsEnabled,
    language,
    settingsError,
  } = useSettings();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Hydration hatasını önlemek için varsayılan false, sonra useEffect ile güncelliyoruz
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Bu kod sadece tarayıcıda çalışır, sunucu ile çakışmayı önler
    try {
      setIsEmbedded(window.self !== window.top);
    } catch (e) {
      setIsEmbedded(true);
    }
  }, []);

  // Hook 1: Veri çekme
  const {
    times,
    bgImage,
    photoCredit,
    dataError,
    imageError,
    isLoading,
    refetch,
  } = usePrayerData(city, coords, language);

  // Hook 2: Sayaç & bildirim
  const {
    countdown,
    nextPrayer,
    selectedPrayer,
    setSelectedPrayer,
    getTranslatedName,
  } = usePrayerTimer(times, language, t, city, notificationsEnabled);

  // Hook OLMAYAN: currentYear (normal değişken)
  const currentYear = new Date().getFullYear();

  // Fallback şehir etiketi (çeviri varsa onu, yoksa dil bazlı string)
  const getFallbackLocationLabel = () => {
    if (t && t.unknownLocation) return t.unknownLocation;
    return language === "en" ? "Location" : "Konum";
  };

  // Konum bulma fonksiyonu
  const handleAutoLocation = async () => {
    // Aynı anda iki kez çalışmasın
    if (isLocating) return;

    // Önceki hatayı sıfırla
    setGeoError(null);

    // Tarayıcı / ortam kontrolü
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoError(
        language === "en"
          ? "Geolocation is not supported in this browser."
          : "Tarayıcınız konum hizmetlerini desteklemiyor."
      );
      return;
    }

    setIsLocating(true);

    try {
      // 1) KULLANICININ KONUMUNU AL
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // Mümkünse GPS kullan
          timeout: 10000, // 10 saniye içinde bulamazsa iptal
          maximumAge: 300000, // 5 dakika cache (pil + hız dengesi)
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;

      // Koordinatları state'e yaz (namaz vakitleri bunlarla çalışacak)
      setCoords({ lat, lng });

      // 2) REVERSE GEOCODING İLE ŞEHİR ADI BUL
      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              format: "json",
              lat,
              lon: lng,
              zoom: 10,
              "accept-language": language,
            },
            timeout: 8000,
          }
        );

        const addr = (res.data && res.data.address) || {};

        const detectedCity =
          addr.city ||
          addr.town ||
          addr.district ||
          addr.province ||
          addr.state ||
          addr.municipality ||
          getFallbackLocationLabel();

        setCity(detectedCity);
      } catch (apiError) {
        // API çökerse: koordinatımız var, şehir ismini generik ver
        setCity(getFallbackLocationLabel());
      }

      // Her durumda (başarılı konum + en azından bir city label) ayarlar penceresini kapat
      setIsSettingsOpen(false);
    } catch (error) {
      // Geolocation hatası (izin reddi / timeout vs.)
      let message = t.locationFailed;

      if (error && typeof error === "object" && "code" in error) {
        const code = error.code;

        if (code === 1) {
          // PERMISSION_DENIED
          message = t.locationDenied;
        } else if (code === 2 || code === 3) {
          // POSITION_UNAVAILABLE / TIMEOUT
          message =
            language === "en"
              ? "Couldn't determine your location. Please try again or select it manually."
              : "Konumunuzu belirleyemedik. Lütfen tekrar deneyin veya elle seçin.";
        }
      }

      setGeoError(message);
    } finally {
      setIsLocating(false);
    }
  };

  // LOADING STATE (BUNDAN SONRA HİÇ HOOK YOK!)
  if (isLoading) {
    return (
      <main className="w-full h-full min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500" />
          <p className="text-xs text-white/70 tracking-widest uppercase">
            {t.loading}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={[
        "relative w-full h-full min-h-screen overflow-hidden flex flex-col items-center justify-center text-white",
        isEmbedded ? "max-w-[400px] mx-auto" : "",
      ].join(" ")}
    >
      <Background
        bgImage={bgImage}
        photoCredit={photoCredit}
        setImageError={() => {}}
        t={t}
        language={language}
      />

      <Header
        city={city}
        onOpenSettings={() => setIsSettingsOpen(true)}
        t={t}
        isEmbedded={isEmbedded}
      />
      <div
        className={[
          "z-10 text-center flex flex-col items-center w-full px-3",
          isEmbedded ? "mt-2" : "mt-4",
        ].join(" ")}
      >
        {isEmbedded && (
          <div className="mb-2 text-[10px] bg-black/40 border border-white/10 px-2 py-0.5 rounded-full text-white/70">
            {t.embedHint}
          </div>
        )}

        {/* Settings kaynaklı uyarı */}
        {settingsError && (
          <div className="mb-3 bg-black/60 border border-yellow-300/30 rounded-2xl p-3 text-xs text-yellow-100">
            {settingsError}
          </div>
        )}

        {/* Data hatası */}
        {dataError && (
          <div className="mb-4 bg-black/60 border border-red-400/30 rounded-2xl p-3 flex items-start gap-2 shadow-lg">
            <AlertTriangle className="text-red-300 mt-0.5" size={16} />
            <div className="text-left">
              <p className="text-xs font-medium text-red-100">{dataError}</p>
              <button
                onClick={refetch}
                className="mt-2 inline-flex items-center gap-1 text-[11px] bg-red-500/20 px-2.5 py-1 rounded-full"
              >
                <RefreshCw size={11} />
                {t.retry}
              </button>
            </div>
          </div>
        )}

        <MainCountdown
          countdown={countdown}
          selectedPrayer={selectedPrayer}
          nextPrayer={nextPrayer}
          getTranslatedName={getTranslatedName}
          t={t}
          onResetSelection={() => setSelectedPrayer(null)}
          language={language}
          isEmbedded={isEmbedded}
        />

        {times ? (
          <PrayerGrid
            times={times}
            nextPrayer={nextPrayer}
            selectedPrayer={selectedPrayer}
            onSelectPrayer={setSelectedPrayer}
            t={t}
          />
        ) : !dataError ? (
          <div className="mt-4 text-[11px] text-white/70 bg-black/40 px-4 py-2 rounded-full border border-white/10">
            {language === "en"
              ? "Prayer times will appear here."
              : "Namaz vakitleri burada görünecek."}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div
        className={[
          "absolute bottom-2 left-0 w-full flex justify-center items-center gap-2 z-20 font-light tracking-wide text-white/60",
          isEmbedded ? "text-[9px]" : "text-[10px] md:text-xs",
        ].join(" ")}
      >
        <span>&copy; {currentYear} Namaz Vakti</span>
        <span className="w-1 h-1 bg-white/40 rounded-full" />
        <Link
          href="/privacy-policy"
          className="hover:text-white hover:underline underline-offset-2 transition-all"
        >
          {language === "en" ? "Privacy Policy" : "Gizlilik Politikası"}
        </Link>
      </div>

      {/* Konum alınıyor bildirimi */}
      {isLocating && !geoError && (
        <div className="absolute top-16 z-20 bg-black/60 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white/80 shadow-lg flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
          <span>
            {language === "en"
              ? "Detecting your location..."
              : "Konumunuz alınıyor..."}
          </span>
        </div>
      )}

      {/* Konum hatası bildirimi */}
      {geoError && !isLocating && (
        <div className="absolute top-16 z-20 bg-black/70 border border-red-500/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-red-100 shadow-lg">
          {geoError}
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onAutoLocation={handleAutoLocation}
      />
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