"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

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
    fajr: "İmsak",
    sunrise: "Güneş",
    dhuhr: "Öğle",
    asr: "İkindi",
    maghrib: "Akşam",
    isha: "Yatsı",
    prayerTimes: "Namaz Vakitleri",
    notificationPermission: "Bildirim İzni",
    notifications: "Bildirimler"
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
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    prayerTimes: "Prayer Times",
    notificationPermission: "Notification Permission",
    notifications: "Notifications"
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
    fajr: "الفجر",
    sunrise: "شروق",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    prayerTimes: "أوقات الصلاة",
    notificationPermission: "إذن الإخطار",
    notifications: "إشعارات"
  }
};

export function SettingsProvider({ children }) {
  const [language, setLanguage] = useState('tr');
  const [city, setCity] = useState('Istanbul'); 
  const [coords, setCoords] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // YENİ: Yükleme Kilidi
  const [isLoading, setIsLoading] = useState(true);

  // 1. OKUMA İŞLEMİ (Sadece sayfa ilk açıldığında çalışır)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('prayer_city');
      const savedLanguage = localStorage.getItem('prayer_language');
      const savedCoords = localStorage.getItem('prayer_coords');
      const savedNotif = localStorage.getItem('prayer_notifications');

      if (savedCity) setCity(savedCity);
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedNotif) setNotificationsEnabled(JSON.parse(savedNotif));
      
      if (savedCoords && savedCoords !== "undefined" && savedCoords !== "null") {
        try {
          const parsedCoords = JSON.parse(savedCoords);
          if (parsedCoords && parsedCoords.lat) {
             setCoords(parsedCoords);
          }
        } catch (e) {
          console.error("Koordinat okuma hatası", e);
        }
      }
      
      // Okuma bitti, kilidi aç!
      setIsLoading(false);
    }
  }, []);

  // 2. YAZMA İŞLEMİ (Sadece veri değişirse çalışır)
  useEffect(() => {
    // DİKKAT: Eğer hala yükleniyorsa sakın kaydetme! (Varsayılanlar ezmesin)
    if (isLoading) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('prayer_city', city);
      localStorage.setItem('prayer_language', language);
      localStorage.setItem('prayer_notifications', JSON.stringify(notificationsEnabled));
      
      if (coords) {
        localStorage.setItem('prayer_coords', JSON.stringify(coords));
      }
    }
  }, [city, language, coords, notificationsEnabled, isLoading]);

  const t = translations[language];

  return (
    <SettingsContext.Provider value={{ 
      language, setLanguage, 
      city, setCity, 
      coords, setCoords, 
      notificationsEnabled, setNotificationsEnabled, 
      isLoading, // Bunu dışarı açtık ki sayfa yüklenirken beklesin
      t 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}