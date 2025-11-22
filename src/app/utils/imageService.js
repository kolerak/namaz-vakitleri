import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { DEFAULT_BACKGROUNDS } from "./constants";

export const getCityImage = async (cityName) => {
  // Varsayılan Dönüş Formatı
  const defaultResult = {
    url: DEFAULT_BACKGROUNDS[0],
    author: "Unsplash / Stok",
    source: "default"
  };

  if (!cityName) return defaultResult;

  const normalizedCity = cityName.toLowerCase().trim();

  try {
    // 1. Firebase Kontrolü
    const docRef = doc(db, "cities", normalizedCity);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Eski kayıtlar sadece string url olabilir, kontrol et
      if (data.imageUrl) {
        console.log(`🔥 Resim Firebase'den: ${cityName}`);
        return {
          url: data.imageUrl,
          author: data.author || "Wikimedia Commons", // Yazar yoksa genel isim
          source: data.source || "cache"
        };
      }
    }

    console.log(`🌍 Resim aranıyor (Cami/Mimari): ${cityName}`);

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
          prop: "imageinfo|extmetadata", // Yazar bilgisini de istiyoruz (extmetadata)
          iiprop: "url|size|user|extmetadata",
          format: "json",
          origin: "*"
        }
      });
      return res.data.query?.pages ? Object.values(res.data.query.pages) : [];
    };

    // Sırayla ara: Cami -> Mimari -> Manzara
    let images = await searchWikimedia(`${cityName} Mosque`);
    if (!images.length) images = await searchWikimedia(`${cityName} Architecture`);
    if (!images.length) images = await searchWikimedia(`${cityName} View`);

    // Filtrele (Genişlik > 600 ve JPG)
    let bestImage = null;
    if (images.length > 0) {
      bestImage = images.find(img => {
        const info = img.imageinfo[0];
        return info.width > 600 && (info.url.endsWith(".jpg") || info.url.endsWith(".jpeg"));
      });
    }

    // Sonuç Hazırla
    if (bestImage) {
      const info = bestImage.imageinfo[0];
      
      // Yazar ismini bulmaya çalış
      let authorName = info.user;
      // Bazen detaylı metadata içinde 'Artist' olarak geçer
      if (info.extmetadata && info.extmetadata.Artist) {
        // HTML taglerini temizle (örn: <b>Name</b> -> Name)
        authorName = info.extmetadata.Artist.value.replace(/<[^>]*>?/gm, ''); 
      }

      const result = {
        url: info.url,
        author: authorName || "Wikimedia User",
        source: "wikimedia"
      };

      // Firebase'e Kaydet
      await setDoc(docRef, {
        imageUrl: result.url,
        author: result.author,
        cityName: cityName,
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