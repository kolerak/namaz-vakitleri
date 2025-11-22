"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

// Çeviri Metinleri
const content = {
  en: {
    title: "Privacy Policy",
    updated: "Last Updated: November 23, 2025",
    back: "Back to App",
    sections: [
      {
        title: "1. Introduction",
        text: "This Privacy Policy explains how the \"Namaz Vakti\" (Prayer Times) Chrome Extension and Web App collects, uses, and protects your information. We respect your privacy and are committed to protecting it."
      },
      {
        title: "2. Data Collection",
        text: "We collect the following data solely for the functionality of the application:",
        list: [
          "Geolocation Data: We access your approximate location (latitude and longitude) via the browser's Geolocation API only when you grant permission.",
          "Preferences: We store your city selection and notification preferences locally on your device."
        ]
      },
      {
        title: "3. Use of Data",
        text: "Your data is used exclusively for the following purposes:",
        list: [
          "To calculate accurate prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for your specific location.",
          "To determine the city name using the OpenStreetMap (Nominatim) API.",
          "To display relevant background photos of your city using Wikimedia APIs."
        ]
      },
      {
        title: "4. Data Storage & Security",
        text: "We do not store your personal data on our servers. All your preferences (City, Language, Notification settings) are stored locally in your browser's LocalStorage.",
        subtext: "Location data is processed instantly to fetch prayer times and is not saved to any external database for tracking purposes."
      },
      {
        title: "5. Third-Party Services",
        text: "The application interacts with the following public APIs:",
        list: [
          "Aladhan API: For prayer time calculations.",
          "OpenStreetMap: For reverse geocoding (finding city name from coordinates).",
          "Wikimedia Commons: For city background images."
        ]
      },
      {
        title: "6. Contact",
        text: "If you have any questions about this Privacy Policy, please contact us via the Chrome Web Store support page."
      },
      {
        title: "7. Open Access",
        text: "This app is an open access app an can be found at github."
      }
      
    ]
  },
  tr: {
    title: "Gizlilik Politikası",
    updated: "Son Güncelleme: 23 Kasım 2025",
    back: "Uygulamaya Dön",
    sections: [
      {
        title: "1. Giriş",
        text: "\"Namaz Vakti\" Chrome Eklentisi ve Web Uygulaması olarak gizliliğinize önem veriyoruz. Bu politika, bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar."
      },
      {
        title: "2. Veri Toplama",
        text: "Uygulamanın çalışabilmesi için sadece aşağıdaki veriler kullanılır:",
        list: [
          "Coğrafi Konum Verisi: Sadece siz izin verdiğinizde, namaz vaktini hesaplamak için tarayıcınızın konum servisine (enlem ve boylam) erişiriz.",
          "Tercihler: Şehir seçiminiz ve bildirim ayarlarınız cihazınızda yerel olarak saklanır."
        ]
      },
      {
        title: "3. Verilerin Kullanımı",
        text: "Verileriniz sadece şu amaçlarla kullanılır:",
        list: [
          "Bulunduğunuz konuma özel namaz vakitlerini (İmsak, Öğle, İkindi, Akşam, Yatsı) hesaplamak.",
          "OpenStreetMap API kullanarak bulunduğunuz şehrin ismini tespit etmek.",
          "Wikimedia API kullanarak şehrinize uygun arka plan fotoğrafını getirmek."
        ]
      },
      {
        title: "4. Veri Saklama ve Güvenlik",
        text: "Kişisel verilerinizi sunucularımızda saklamayız. Tüm tercihleriniz (Şehir, Dil, Bildirimler) tarayıcınızın LocalStorage (Yerel Hafıza) alanında tutulur.",
        subtext: "Konum verisi anlık olarak işlenir ve herhangi bir takip amacıyla veritabanına kaydedilmez."
      },
      {
        title: "5. Üçüncü Taraf Hizmetler",
        text: "Uygulama şu güvenilir kamu servisleriyle iletişim kurar:",
        list: [
          "Aladhan API: Namaz vakitlerini hesaplamak için.",
          "OpenStreetMap: Koordinattan şehir ismini bulmak için.",
          "Wikimedia Commons: Şehir fotoğrafları için."
        ]
      },
      {
        title: "6. İletişim",
        text: "Bu gizlilik politikası hakkında sorularınız varsa, Chrome Web Mağazası destek sayfası üzerinden bize ulaşabilirsiniz."
      },
      {
        title: "7. Açık Kaynak Kodlu",
        text: "Bu uygulama açık kaynak kodludur ve GitHub'da bulunabilir."
      }
    ]
  }
};

export default function PrivacyPolicy() {
  const [lang, setLang] = useState('en'); // Varsayılan İngilizce (Google için)
  const t = content[lang];

  // Sayfa Başlığını Değiştir
  useEffect(() => {
    document.title = lang === 'en' ? "Privacy Policy - Namaz Vakti" : "Gizlilik Politikası - Namaz Vakti";
  }, [lang]);

  return (
    <main className="min-h-screen bg-black text-gray-300 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto relative">
        
        {/* Üst Bar: Geri Dön ve Dil Değiştir */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition">
            <ArrowLeft size={20} /> {t.back}
          </Link>

          {/* Dil Değiştirme Butonları */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button 
              onClick={() => setLang('en')}
              className={`px-4 py-1 rounded-md text-sm font-medium transition ${lang === 'en' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang('tr')}
              className={`px-4 py-1 rounded-md text-sm font-medium transition ${lang === 'tr' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Türkçe
            </button>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-gray-500 mb-8">{t.updated}</p>

        <div className="space-y-8">
          {t.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-2xl font-semibold text-white mb-3">{section.title}</h2>
              <p>{section.text}</p>
              
              {/* Varsa Liste */}
              {section.list && (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {section.list.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(':', ':</strong>').replace(/^/, '<strong>') }} />
                  ))}
                </ul>
              )}

              {/* Varsa Alt Metin */}
              {section.subtext && (
                <p className="mt-2 opacity-80">{section.subtext}</p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-gray-600 text-center">
          &copy; {new Date().getFullYear()} Namaz Vakti App. All rights reserved.
        </div>
      </div>
    </main>
  );
}