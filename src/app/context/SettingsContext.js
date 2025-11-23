"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";

const SettingsContext = createContext(null);

const STORAGE_KEYS = {
  city: "prayer_city",
  language: "prayer_language",
  coords: "prayer_coords",
  notifications: "prayer_notifications",
};

const translations = {
  tr: {
    loading: "Yükleniyor...",
    nextPrayer: "Sıradaki Namaz",
    remainingTime: "Kalan Süre",
    cityPlaceholder: "Şehir Ara...",
    settings: "Ayarlar",
    language: "Dil",
    location: "Konum",
    autoLocation: "Otomatik Konum Bul",
    save: "Kaydet",
    close: "Kapat",
    retry: "Tekrar dene",
    fajr: "İmsak",
    sunrise: "Güneş",
    dhuhr: "Öğle",
    asr: "İkindi",
    maghrib: "Akşam",
    isha: "Yatsı",
    prayerTimes: "Namaz Vakitleri",
    notificationPermission: "Bildirim İzni",
    notifications: "Bildirimler",
    enable: "Aç",
    disable: "Kapat",
    locationDenied: "Konum izni reddedildi.",
    locationFailed: "Konum alınamadı.",
    cityDetectFailed: "Şehir bulunamadı, koordinatlar kullanılıyor.",
    embedHint: "",

    // ✅ NEW keys for consistent i18n
    notifOn: "Bildirimler Açık",
    notifOff: "Bildirimleri Aç",
    browserNoNotif: "Tarayıcınız bildirimleri desteklemiyor.",
    permissionDenied:
      "Bildirim izni reddedildi. Tarayıcı ayarlarından izin vermelisiniz.",
    testTitle: "Bismillah!",
    testBody:
      "Bildirimler başarıyla açıldı. Namaz vakitlerinde haber vereceğim.",
    modalDesc:
      "Dil, konum ve bildirim ayarlarını buradan değiştirebilirsiniz.",
    or: "- VEYA -",
    autoLocationAria: "Otomatik konum bul",
    closeAria: "Ayarları kapat",
  },

  en: {
    loading: "Loading...",
    nextPrayer: "Next Prayer",
    remainingTime: "Time Remaining",
    cityPlaceholder: "Search City...",
    settings: "Settings",
    language: "Language",
    location: "Location",
    autoLocation: "Find Auto Location",
    save: "Save",
    close: "Close",
    retry: "Retry",
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    prayerTimes: "Prayer Times",
    notificationPermission: "Notification Permission",
    notifications: "Notifications",
    enable: "Enable",
    disable: "Disable",
    locationDenied: "Location permission denied.",
    locationFailed: "Couldn't get location.",
    cityDetectFailed: "Couldn't detect city name, using coordinates.",
    embedHint: "",

    // ✅ NEW
    notifOn: "Notifications On",
    notifOff: "Enable Notifications",
    browserNoNotif: "Your browser doesn’t support notifications.",
    permissionDenied:
      "Notification permission denied. Please allow it in browser settings.",
    testTitle: "Bismillah!",
    testBody: "Notifications enabled. I’ll notify you at prayer times.",
    modalDesc:
      "You can change language, location, and notification settings here.",
    or: "- OR -",
    autoLocationAria: "Find auto location",
    closeAria: "Close settings",
  },

  ar: {
    loading: "جار التحميل...",
    nextPrayer: "الصلاة التالية",
    remainingTime: "الوقت المتبقي",
    cityPlaceholder: "بحث عن مدينة...",
    settings: "الإعدادات",
    language: "لغة",
    location: "موقع",
    autoLocation: "تحديد الموقع تلقائيا",
    save: "حفظ",
    close: "إغلاق",
    retry: "أعد المحاولة",
    fajr: "الفجر",
    sunrise: "شروق",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    prayerTimes: "أوقات الصلاة",
    notificationPermission: "إذن الإخطار",
    notifications: "إشعارات",
    enable: "تفعيل",
    disable: "إيقاف",
    locationDenied: "تم رفض إذن الموقع.",
    locationFailed: "تعذر الحصول على الموقع.",
    cityDetectFailed: "تعذر تحديد المدينة، سيتم استخدام الإحداثيات.",
    embedHint: "",

    // ✅ NEW
    notifOn: "الإشعارات مفعّلة",
    notifOff: "تفعيل الإشعارات",
    browserNoNotif: "المتصفح لا يدعم الإشعارات.",
    permissionDenied:
      "تم رفض إذن الإشعارات. يرجى تفعيله من إعدادات المتصفح.",
    testTitle: "بسم الله!",
    testBody: "تم تفعيل الإشعارات. سأقوم بإعلامك في أوقات الصلاة.",
    modalDesc:
      "يمكنك تغيير اللغة والموقع وإعدادات الإشعارات من هنا.",
    or: "- أو -",
    autoLocationAria: "تحديد الموقع تلقائياً",
    closeAria: "إغلاق الإعدادات",
  },
};

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState("tr");
  const [city, setCity] = useState("Istanbul");
  const [coords, setCoords] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(null);

  // Read once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedCity = localStorage.getItem(STORAGE_KEYS.city);
      const savedLanguage = localStorage.getItem(STORAGE_KEYS.language);
      const savedCoords = localStorage.getItem(STORAGE_KEYS.coords);
      const savedNotif = localStorage.getItem(STORAGE_KEYS.notifications);

      if (savedCity) setCity(savedCity);
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }
      if (savedNotif != null) {
        setNotificationsEnabled(JSON.parse(savedNotif));
      }

      if (
        savedCoords &&
        savedCoords !== "undefined" &&
        savedCoords !== "null"
      ) {
        const parsed = JSON.parse(savedCoords);
        if (parsed?.lat && parsed?.lng) setCoords(parsed);
      }
    } catch (e) {
      console.error("Settings read error:", e);
      setSettingsError("Settings could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Write on change (after load)
  useEffect(() => {
    if (isLoading || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.city, city);
      localStorage.setItem(STORAGE_KEYS.language, language);
      localStorage.setItem(
        STORAGE_KEYS.notifications,
        JSON.stringify(notificationsEnabled)
      );

      if (coords) {
        localStorage.setItem(STORAGE_KEYS.coords, JSON.stringify(coords));
      } else {
        localStorage.removeItem(STORAGE_KEYS.coords);
      }
    } catch (e) {
      console.error("Settings write error:", e);
      setSettingsError("Settings could not be saved.");
    }
  }, [city, language, coords, notificationsEnabled, isLoading]);

  const t = useMemo(
    () => translations[language] || translations.tr,
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      city,
      setCity,
      coords,
      setCoords,
      notificationsEnabled,
      setNotificationsEnabled,
      isLoading,
      settingsError,
      setSettingsError,
      t,
    }),
    [
      language,
      city,
      coords,
      notificationsEnabled,
      isLoading,
      settingsError,
      t,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
