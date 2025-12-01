import { useState, useEffect, useCallback } from "react";
import { PRAYER_NAMES_ORDER } from "../utils/constants";

export function usePrayerTimer(times, language, t, city, notificationsEnabled) {
  const [nextPrayer, setNextPrayer] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [lastNotifiedTime, setLastNotifiedTime] = useState(null);

  // ✅ DÜZELTİLDİ: Artık formatlama "t" üzerinden yapılıyor.
  const formatCountdown = useCallback((h, m, s) => {
    return `${h}${t.time_h} ${m}${t.time_m} ${s}${t.time_s}`;
  }, [t]);

  const getTranslatedName = useCallback((name) => t?.[name?.toLowerCase()] || name, [t]);

  useEffect(() => {
    if (!times) return;

    const safeParse = (str) => {
      if (!str || !str.includes(":")) return null;
      const [h, m] = str.split(":").map(Number);
      return { h, m };
    };

    const runTimer = () => {
      const now = new Date();
      
      const currentHours = now.getHours().toString().padStart(2, "0");
      const currentMinutes = now.getMinutes().toString().padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (notificationsEnabled && typeof Notification !== "undefined") {
        const currentPrayerName = PRAYER_NAMES_ORDER.find((name) => {
          const apiTime = times[name];
          return apiTime && apiTime.substring(0, 5) === currentTimeStr;
        });

        if (currentPrayerName && lastNotifiedTime !== currentTimeStr) {
          
          if (Notification.permission === "granted") {
            const prayerName = getTranslatedName(currentPrayerName);

            // ✅ DÜZELTİLDİ: Bildirim metinleri "t" üzerinden alınıyor.
            const title = `${t.timeIsUp}: ${prayerName}`;
            
            // "{city} için {prayer} vakti girdi" şeklindeki template'i dolduruyoruz
            const body = t.notifBody
              .replace("{city}", city)
              .replace("{prayer}", prayerName);

            try {
              new Notification(title, {
                body,
                icon: "/icon.png",
                silent: true,
              });

              const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
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
        if (parsed) {
          targetTime = new Date();
          targetTime.setHours(parsed.h, parsed.m, 0);
          if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);
        }
      } else {
        for (let name of PRAYER_NAMES_ORDER) {
          const parsed = safeParse(times[name]);
          if (!parsed) continue;
          const pTime = new Date();
          pTime.setHours(parsed.h, parsed.m, 0);
          if (pTime > now) {
            targetTime = pTime;
            targetName = name;
            break;
          }
        }
        if (!targetTime) {
           const parsed = safeParse(times["Fajr"]);
           if(parsed) {
             targetTime = new Date();
             targetTime.setDate(targetTime.getDate() + 1);
             targetTime.setHours(parsed.h, parsed.m, 0);
             targetName = "Fajr";
           }
        }
        setNextPrayer(targetName);
      }

      if (targetTime) {
        const diff = targetTime - now;
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCountdown(formatCountdown(h, m, s));
      }
    };

    runTimer();
    const interval = setInterval(runTimer, 1000);
    return () => clearInterval(interval);
  }, [times, selectedPrayer, notificationsEnabled, lastNotifiedTime, language, city, t, formatCountdown, getTranslatedName]);

  return { 
    countdown, 
    nextPrayer, 
    selectedPrayer, 
    setSelectedPrayer,
    getTranslatedName 
  };
}