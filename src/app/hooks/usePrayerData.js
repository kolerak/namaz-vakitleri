import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { getCityImage } from "../utils/imageService";
import { BACKGROUND_IMAGES as DEFAULT_BACKGROUNDS } from "../utils/constants";

export function usePrayerData(city, coords, language) {
  const [times, setTimes] = useState(null);
  const [bgImage, setBgImage] = useState(DEFAULT_BACKGROUNDS[0]);
  const [photoCredit, setPhotoCredit] = useState({ author: "", source: "" });
  const [dataError, setDataError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Unmount kontrolü
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  const fetchData = useCallback(async () => {
    if (!city) return;
    setIsLoading(true);
    setDataError(null);
    setImageError(false);

    try {
      // 1. Namaz Vakitleri
      const url = coords
        ? `https://api.aladhan.com/v1/timings?latitude=${coords.lat}&longitude=${coords.lng}&method=13`
        : `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Turkey&method=13`;

      const res = await axios.get(url, { timeout: 12000 });
      if (mountedRef.current) {
        setTimes(res?.data?.data?.timings);
      }

      // 2. Arkaplan Resmi (Best-effort)
      try {
        const imageData = await getCityImage(city);
        if (imageData?.url && mountedRef.current) {
          setBgImage(imageData.url);
          setPhotoCredit({ author: imageData.author || "Unknown", source: imageData.source || "" });
        } else {
          setBgImage(DEFAULT_BACKGROUNDS[0]);
        }
      } catch {
        if (mountedRef.current) {
          setBgImage(DEFAULT_BACKGROUNDS[Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)]);
          setImageError(true);
        }
      }
    } catch (error) {
      console.error("Veri hatası:", error);
      if (mountedRef.current) {
        setTimes(null);
        setDataError(language === "en" ? "Fetch failed." : "Veri alınamadı.");
        setBgImage(DEFAULT_BACKGROUNDS[0]);
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [city, coords, language]);

  // Şehir veya koordinat değişince otomatik çek
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { times, bgImage, photoCredit, dataError, imageError, isLoading, refetch: fetchData };
}