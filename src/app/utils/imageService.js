import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { DEFAULT_BACKGROUNDS } from "./constants";

// 1. SENİN ÖZEL RESİM LİSTEN
const LOCAL_IMAGES = {
  "istanbul": "/backgrounds/istanbul.jpg",
  "ankara": "/backgrounds/ankara.jpg",
  // ... diğerleri
};

export const getCityImage = async (cityName) => {
  const defaultResult = {
    url: DEFAULT_BACKGROUNDS ? DEFAULT_BACKGROUNDS[0] : "",
    author: "Stok Görsel",
    source: "default"
  };

  if (!cityName) return defaultResult;

  // --- DÜZELTME BURADA ---
  // Türkçe karakterleri (İ, ı, Ş, ş) düzgünce küçük harfe çevir.
  // "İstanbul" -> "istanbul"
  // "IĞDIR" -> "ığdır"
  const normalizedCity = cityName.toLocaleLowerCase('tr').trim();

  // --- ADIM 0: YEREL DOSYA KONTROLÜ ---
  if (LOCAL_IMAGES[normalizedCity]) {
    console.log(`📂 Yerel dosya kullanılıyor: ${normalizedCity}`);
    return {
      url: LOCAL_IMAGES[normalizedCity],
      author: "Özel Koleksiyon",
      source: "local"
    };
  }

  try {
    // 1. Firebase Kontrolü (Artık normalizedCity kullandığımız için tek kayıt olacak)
    const docRef = doc(db, "cities", normalizedCity);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.imageUrl) {
        return {
          url: data.imageUrl,
          author: data.author || "Wikimedia Commons",
          source: data.source || "cache"
        };
      }
    }

    // 2. Wikimedia Arama
    const commonsUrl = `https://commons.wikimedia.org/w/api.php`;
    const searchWikimedia = async (searchTerm) => {
      const res = await axios.get(commonsUrl, {
        params: {
          action: "query",
          generator: "search",
          gsrnamespace: 6,
          gsrsearch: `file:${searchTerm} filetype:bitmap`,
          gsrlimit: 3,
          prop: "imageinfo|extmetadata",
          iiprop: "url|size|user|extmetadata",
          format: "json",
          origin: "*"
        }
      });
      return res.data.query?.pages ? Object.values(res.data.query.pages) : [];
    };

    let images = await searchWikimedia(`${cityName} Mosque`);
    if (!images.length) images = await searchWikimedia(`${cityName} Architecture`);
    if (!images.length) images = await searchWikimedia(`${cityName} View`);

    let bestImage = null;
    if (images.length > 0) {
      bestImage = images.find(img => {
        const info = img.imageinfo[0];
        return info.width > 600 && (info.url.endsWith(".jpg") || info.url.endsWith(".jpeg"));
      });
    }

    if (bestImage) {
      const info = bestImage.imageinfo[0];
      let authorName = info.user;
      if (info.extmetadata && info.extmetadata.Artist) {
        authorName = info.extmetadata.Artist.value.replace(/<[^>]*>?/gm, ''); 
      }

      const result = {
        url: info.url,
        author: authorName || "Wikimedia User",
        source: "wikimedia"
      };

      // Firebase'e kaydederken de normalizedCity kullanıyoruz
      await setDoc(docRef, {
        imageUrl: result.url,
        author: result.author,
        cityName: cityName, // Orijinal ismini de bilgi olarak saklayalım (Görüntüleme için)
        source: result.source,
        updatedAt: new Date().toISOString()
      });

      return result;
    }
    return defaultResult;
  } catch (error) {
    console.error("Hata:", error);
    return defaultResult;
  }
};