"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  MapPin,
  RefreshCw,
  Camera,
  AlertTriangle,
} from "lucide-react";

import { SettingsProvider, useSettings } from "./context/SettingsContext";
import PrayerGrid from "./components/PrayerGrid";
import SettingsModal from "./components/SettingsModal";
import {
  PRAYER_NAMES_ORDER,
  BACKGROUND_IMAGES as DEFAULT_BACKGROUNDS,
} from "./utils/constants";
import { getCityImage } from "./utils/imageService";

function AppContent() {
  const {
    city,
    setCity,
    setCoords,
    coords,
    t,
    notificationsEnabled,
    isLoading,
    language,
    settingsError,
    setSettingsError,
  } = useSettings();

  const [times, setTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [countdown, setCountdown] = useState("");

  const [bgImage, setBgImage] = useState(DEFAULT_BACKGROUNDS[0]);
  const [photoCredit, setPhotoCredit] = useState({ author: "", source: "" });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastNotifiedTime, setLastNotifiedTime] = useState(null);

  const [dataError, setDataError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // iframe/extension detection
  const isEmbedded = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  // prevent setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  const getTranslatedName = useCallback(
    (name) => t?.[name?.toLowerCase()] || name,
    [t]
  );

  const formatCountdown = useCallback(
    (h, m, s) => {
      if (language === "en") return `${h}h ${m}m ${s}s`;
      if (language === "ar") return `${h}س ${m}د ${s}ث`;
      return `${h}sa ${m}dk ${s}sn`;
    },
    [language]
  );

  useEffect(() => {
    if (city && t) document.title = `${city} - ${t.prayerTimes}`;
  }, [city, t]);

  const fetchData = useCallback(async () => {
    if (isLoading || !city) return;

    setDataError(null);
    setSettingsError?.(null);
    setImageError(false);

    try {
      const url = coords
        ? `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=13`
        : `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
            city
          )}&country=Turkey&method=13`;

      const res = await axios.get(url, { timeout: 12_000 });

      const timings = res?.data?.data?.timings;
      if (!timings || typeof timings !== "object")
        throw new Error("Invalid timings payload");

      if (mountedRef.current) setTimes(timings);

      // background best-effort
      try {
        const imageData = await getCityImage(city);
        if (imageData?.url && mountedRef.current) {
          setBgImage(imageData.url);
          setPhotoCredit({
            author: imageData.author || "Unknown",
            source: imageData.source || "",
          });
        } else {
          setBgImage(DEFAULT_BACKGROUNDS[0]);
        }
      } catch {
        if (!mountedRef.current) return;
        setBgImage(
          DEFAULT_BACKGROUNDS[
            Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)
          ]
        );
        setPhotoCredit({ author: "", source: "" });
        setImageError(true);
      }
    } catch (error) {
      console.error("Veri hatası:", error);
      if (!mountedRef.current) return;

      setTimes(null);
      setNextPrayer(null);
      setCountdown("");

      setDataError(
        language === "en"
          ? "Couldn't fetch prayer times. Please try again."
          : "Namaz vakitleri alınamadı. Lütfen tekrar deneyin."
      );

      setBgImage(
        DEFAULT_BACKGROUNDS[
          Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)
        ]
      );
    }
  }, [city, coords, isLoading, language, setSettingsError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!times) return;

    const safeParse = (str) => {
      if (!str || typeof str !== "string" || !str.includes(":")) return null;
      const [h, m] = str.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return { h, m };
    };

    const runTimer = () => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // notifications best-effort
      if (notificationsEnabled && typeof Notification !== "undefined") {
        const currentPrayerName = PRAYER_NAMES_ORDER.find(
          (name) => times[name] === currentTimeStr
        );

        if (currentPrayerName && lastNotifiedTime !== currentTimeStr) {
          if (Notification.permission === "granted") {
            const prayerName = getTranslatedName(currentPrayerName);

            const title =
              language === "en"
                ? `Time for ${prayerName}`
                : `Vakit Geldi: ${prayerName}`;

            const body =
              language === "en"
                ? `Prayer time for ${city}.`
                : `${city} için ${prayerName} vakti girdi.`;

            try {
              new Notification(title, {
                body,
                icon: "/icon.png",
                silent: true,
              });

              const audio = new Audio(
                "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
              );
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }
          setLastNotifiedTime(currentTimeStr);
        }
      }

      let targetTime = null;
      let targetName = "";

      if (selectedPrayer) {
        targetName = selectedPrayer;
        const parsed = safeParse(times[selectedPrayer]);
        if (!parsed) return;

        targetTime = new Date();
        targetTime.setHours(parsed.h, parsed.m, 0);
        if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);
      } else {
        for (let name of PRAYER_NAMES_ORDER) {
          const parsed = safeParse(times[name]);
          if (!parsed) continue;

          const prayerTime = new Date();
          prayerTime.setHours(parsed.h, parsed.m, 0);

          if (prayerTime > now) {
            targetTime = prayerTime;
            targetName = name;
            break;
          }
        }

        if (!targetTime) {
          const parsed = safeParse(times["Fajr"]);
          if (!parsed) return;

          targetTime = new Date();
          targetTime.setDate(targetTime.getDate() + 1);
          targetTime.setHours(parsed.h, parsed.m, 0);
          targetName = "Fajr";
        }

        setNextPrayer(targetName);
      }

      const diff = targetTime - now;
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown(formatCountdown(h, m, s));
    };

    runTimer();
    const interval = setInterval(runTimer, 1000);
    return () => clearInterval(interval);
  }, [
    times,
    selectedPrayer,
    notificationsEnabled,
    lastNotifiedTime,
    language,
    city,
    getTranslatedName,
    formatCountdown,
  ]);

  const handleAutoLocation = () => {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError(
        language === "en" ? "Geolocation not supported." : "Konum desteği yok."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language}`,
            { timeout: 10_000 }
          );

          const detectedCity =
            res?.data?.address?.town ||
            res?.data?.address?.city ||
            res?.data?.address?.province ||
            "Konum";

          setCity(detectedCity);
          setIsSettingsOpen(false);
        } catch {
          setCity("Konum");
          setGeoError(t.cityDetectFailed);
        }
      },
      (err) => {
        const msg =
          err.code === 1
            ? t.locationDenied
            : t.locationFailed;
        setGeoError(msg);
        setIsSettingsOpen(true);
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  };

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
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={`${city || "background"}`}
          fill
          priority
          onError={() => {
            setBgImage(DEFAULT_BACKGROUNDS[0]);
            setImageError(true);
          }}
          className="object-cover object-center transition-all duration-1000 transform scale-110"
          quality={80}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,220,100,0.12),transparent_55%)]" />

      {/* Header */}
      <div className="absolute top-0 w-full p-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 bg-black/35 p-2 px-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg shadow-black/30">
          <MapPin size={14} className="text-yellow-400" />
          <span className="font-semibold tracking-wide text-xs">
            {(city || "—").toUpperCase()}
          </span>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          aria-label={t.settings}
          className="p-2 bg-black/35 rounded-full hover:bg-white/20 transition backdrop-blur-md border border-white/10 shadow-lg shadow-black/30"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Content */}
      <div
        className={[
          "z-10 text-center flex flex-col items-center w-full px-3",
          isEmbedded ? "mt-2" : "mt-4",
        ].join(" ")}
      >
        {/* Embedded badge */}
        {isEmbedded && (
          <div className="mb-2 text-[10px] bg-black/40 border border-white/10 px-2 py-0.5 rounded-full text-white/70">
            {t.embedHint}
          </div>
        )}

        {/* Storage error */}
        {settingsError && (
          <div className="mb-3 w-full max-w-md bg-black/60 border border-yellow-300/30 backdrop-blur-md rounded-2xl p-3 text-xs text-yellow-100">
            {settingsError}
          </div>
        )}

        {/* Data Error */}
        {dataError && (
          <div className="mb-4 w-full max-w-md bg-black/60 border border-red-400/30 backdrop-blur-md rounded-2xl p-3 flex items-start gap-2 shadow-lg">
            <AlertTriangle className="text-red-300 mt-0.5" size={16} />
            <div className="text-left">
              <p className="text-xs font-medium text-red-100">{dataError}</p>
              <button
                onClick={fetchData}
                className="mt-2 inline-flex items-center gap-1 text-[11px] bg-red-500/20 hover:bg-red-500/40 border border-red-300/30 px-2.5 py-1 rounded-full transition"
              >
                <RefreshCw size={11} />
                {t.retry}
              </button>
            </div>
          </div>
        )}

        {/* Countdown */}
        <div className={isEmbedded ? "mb-4" : "mb-6"}>
          <p className="text-[10px] md:text-sm font-light opacity-90 mb-1 uppercase tracking-widest text-blue-200">
            {selectedPrayer
              ? (language === "en"
                  ? `${t.remainingTime} for ${getTranslatedName(selectedPrayer)}`
                  : `${getTranslatedName(selectedPrayer)} ${t.remainingTime}`
                )
              : t.remainingTime}
          </p>

          <h1
            className={[
              "font-[5]  tabular-nums tracking-tighter drop-shadow-xl leading-tight",
              isEmbedded ? "text-5xl" : "text-6xl md:text-8xl",
            ].join(" ")}
          >
            {countdown || (language === "en" ? "0h 0m 0s" : "00sa 00dk 00sn")}
          </h1>

          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md py-1 px-4 rounded-full inline-block border border-white/10 shadow-lg">
              <span className={isEmbedded ? "text-sm" : "text-base"}>
                {selectedPrayer ? t.nextPrayer + " (Seçili)" : t.nextPrayer}:{" "}
                <span className="font-bold text-yellow-300">
                  {getTranslatedName(selectedPrayer || nextPrayer)}
                </span>
              </span>
            </div>

            {selectedPrayer && (
              <button
                onClick={() => setSelectedPrayer(null)}
                className="text-[11px] flex items-center gap-1 text-gray-200 hover:text-white bg-black/40 px-3 py-1 rounded-full transition hover:bg-red-500/80"
              >
                <RefreshCw size={10} />
                {language === "en" ? "Back to auto" : "Otomatiğe Dön"}
              </button>
            )}
          </div>
        </div>

        {/* Prayer grid */}
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
        <span>&copy; {new Date().getFullYear()} Namaz Vakti</span>
        <span className="w-1 h-1 bg-white/40 rounded-full" />
        <Link
          href="/privacy-policy"
          className="hover:text-white hover:underline underline-offset-2 transition-all"
        >
          {language === "en" ? "Privacy Policy" : "Gizlilik Politikası"}
        </Link>
      </div>

      {/* Photo credit */}
      <div className="absolute bottom-2 right-2 z-20 flex flex-col items-end gap-1">
        {(photoCredit.author || imageError) && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/25 hover:bg-black/60 backdrop-blur-sm border border-white/5 rounded-full text-[9px] text-white/60 hover:text-white transition-all duration-300">
            <Camera size={11} />
            <span className="max-w-[110px] truncate font-light tracking-wide">
              {photoCredit.author ||
                (language === "en"
                  ? "Default background"
                  : "Varsayılan arkaplan")}
            </span>
          </div>
        )}
      </div>

      {/* Geo error toast */}
      {geoError && (
        <div className="absolute top-16 z-20 bg-black/60 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white/80 shadow-lg">
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
