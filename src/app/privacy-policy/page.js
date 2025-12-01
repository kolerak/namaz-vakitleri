"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Shield, Lock, Cpu, Check, Globe } from "lucide-react";

/**
 * ------------------------------------------------------------------
 * 1. STATIC CONTENT DATA
 * Veri katmanı render döngüsünden izole edildi.
 * ------------------------------------------------------------------
 */
const contentData = {
  en: {
    metaTitle: "Privacy Policy | Namaz Vakti",
    metaDesc: "Read our Privacy Policy to understand how Namaz Vakti uses your data. We prioritize your privacy and do not store personal information.",
    title: "Privacy Policy",
    subtitle: "Simple, transparent, and private.",
    updated: "Last Updated: Nov 23, 2025",
    back: "Go Back",
    sections: [
      {
        id: "intro",
        number: "01",
        title: "Introduction",
        text: "We respect your privacy. This policy explains what information the 'Namaz Vakti' extension collects and how it is used. Our goal is to be completely transparent."
      },
      {
        id: "collection",
        number: "02",
        title: "Data Collection",
        text: "We only collect the minimum data required for the app to work properly:",
        list: [
          { label: "Location", desc: "We use your latitude and longitude only to calculate prayer times." },
          { label: "Preferences", desc: "Your city selection and settings are saved locally on your device." }
        ]
      },
      {
        id: "usage",
        number: "03",
        title: "How We Use Data",
        text: "We do not sell or share your data. It is used strictly for the following features:",
        list: [
          { label: "Prayer Times", desc: "Calculating accurate times for Fajr, Dhuhr, Asr, Maghrib, and Isha." },
          { label: "City Name", desc: "Finding the name of your city based on your location." },
          { label: "Backgrounds", desc: "Showing relevant photos of your city." }
        ]
      },
      {
        id: "storage",
        number: "04",
        title: "Data Storage",
        text: "We do not store your personal data on our servers. Everything happens on your device.",
        subtext: "Your location is used instantly to fetch data and is not saved to any database."
      },
      {
        id: "third-party",
        number: "05",
        title: "Third-Party Services",
        text: "We use the following trusted public services to provide data:",
        list: [
          { label: "Aladhan API", desc: "For prayer time calculations." },
          { label: "OpenStreetMap", desc: "To find your city name." },
          { label: "Wikimedia", desc: "For city background images." }
        ]
      },
      {
        id: "contact",
        number: "06",
        title: "Contact Us",
        text: "If you have any questions about this policy, please contact us via the Chrome Web Store support page."
      },
      {
        id: "opensource",
        number: "07",
        title: "Open Source",
        text: "Our code is open source. You can review exactly how it works on our GitHub repository."
      }
    ]
  },
  tr: {
    metaTitle: "Gizlilik Politikası | Namaz Vakti",
    metaDesc: "Namaz Vakti uygulamasının verilerinizi nasıl kullandığını öğrenin. Kişisel verilerinizi saklamıyoruz ve gizliliğinize önem veriyoruz.",
    title: "Gizlilik Politikası",
    subtitle: "Basit, şeffaf ve güvenli.",
    updated: "Son Güncelleme: 1 Aralık 2025",
    back: "Geri Dön",
    sections: [
      {
        id: "intro",
        number: "01",
        title: "Giriş",
        text: "Gizliliğinize saygı duyuyoruz. Bu politika, 'Namaz Vakti' eklentisinin hangi bilgileri topladığını ve nasıl kullandığını açıklar."
      },
      {
        id: "collection",
        number: "02",
        title: "Toplanan Veriler",
        text: "Sadece uygulamanın çalışması için gerekli olan minimum veriyi kullanıyoruz:",
        list: [
          { label: "Konum", desc: "Enlem ve boylam bilgilerinizi sadece namaz vakitlerini hesaplamak için kullanırız." },
          { label: "Tercihler", desc: "Şehir seçiminiz ve ayarlarınız sadece kendi cihazınızda saklanır." }
        ]
      },
      {
        id: "usage",
        number: "03",
        title: "Verilerin Kullanımı",
        text: "Verilerinizi satmıyoruz veya paylaşmıyoruz. Bilgileriniz sadece şu özellikler için kullanılır:",
        list: [
          { label: "Namaz Vakitleri", desc: "İmsak, Öğle, İkindi, Akşam ve Yatsı vakitlerinin hesaplanması." },
          { label: "Şehir İsmi", desc: "Konumunuza göre bulunduğunuz şehrin adının bulunması." },
          { label: "Arka Planlar", desc: "Şehrinize uygun fotoğrafların gösterilmesi." }
        ]
      },
      {
        id: "storage",
        number: "04",
        title: "Veri Saklama",
        text: "Kişisel verilerinizi sunucularımızda saklamıyoruz. Her şey sizin cihazınızda gerçekleşir.",
        subtext: "Konum bilginiz veri çekmek için anlık kullanılır ve hiçbir veritabanına kaydedilmez."
      },
      {
        id: "third-party",
        number: "05",
        title: "Kullanılan Servisler",
        text: "Veri sağlamak için aşağıdaki güvenilir servisleri kullanıyoruz:",
        list: [
          { label: "Aladhan API", desc: "Namaz vakti hesaplamaları için." },
          { label: "OpenStreetMap", desc: "Şehir ismini bulmak için." },
          { label: "Wikimedia", desc: "Şehir fotoğrafları için." }
        ]
      },
      {
        id: "contact",
        number: "06",
        title: "İletişim",
        text: "Bu politika hakkında sorularınız varsa, Chrome Web Mağazası destek sayfası üzerinden bize ulaşabilirsiniz."
      },
      {
        id: "opensource",
        number: "07",
        title: "Açık Kaynak",
        text: "Kodlarımız açık kaynaktır. Uygulamanın nasıl çalıştığını GitHub üzerinden inceleyebilirsiniz."
      }
    ]
  }
};

/**
 * ------------------------------------------------------------------
 * 2. INJECTED STYLES (GPU ACCELERATED)
 * Harici CSS dosyasına gerek yok. GPU optimizasyonlu animasyonlar.
 * ------------------------------------------------------------------
 */
const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes liquid-blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes float-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-blob {
      animation: liquid-blob 10s infinite cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform; /* GPU Layer Hack */
    }
    .animate-float {
      animation: float-slow 6s ease-in-out infinite;
      will-change: transform;
    }
    .glass-panel {
      background: rgba(23, 23, 23, 0.4); /* Zinc-900 with opacity */
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    .text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      background-image: linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 100%);
    }
    /* Smooth Scrollbar for Webkit */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #09090b; }
    ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #52525b; }
    
    html {
      scroll-behavior: smooth;
    }
  `}</style>
);

/**
 * ------------------------------------------------------------------
 * 3. MAIN COMPONENT
 * ------------------------------------------------------------------
 */
export default function PrivacyPolicy() {
  const [lang, setLang] = useState("en");
  const [showTopBtn, setShowTopBtn] = useState(false);
  
  // useMemo: Veri işlemeyi render'dan ayırır (Performans +1)
  const t = useMemo(() => contentData[lang], [lang]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true }); // Passive listener for scrolling performance
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO & Meta Tag Injection (Client-Side Patch)
  useEffect(() => {
    document.title = t.metaTitle;
    document.documentElement.lang = lang;

    // Meta Description Güncelleme
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = t.metaDesc;
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      metaDescription.content = t.metaDesc;
      document.head.appendChild(metaDescription);
    }
  }, [lang, t.metaTitle, t.metaDesc]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <GlobalStyles />
      <div className="relative min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-indigo-500/30 overflow-hidden">
        
        {/* --- LIQUID BACKGROUND (GPU Accelerated) --- */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50" aria-hidden="true">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[300px] min-h-[300px] bg-indigo-900/30 rounded-full blur-[120px] animate-blob mix-blend-screen" />
          <div className="absolute top-[20%] right-[-5%] w-[40vw] h-[40vw] min-w-[250px] min-h-[250px] bg-blue-900/20 rounded-full blur-[100px] animate-blob mix-blend-screen" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] min-w-[350px] min-h-[350px] bg-violet-900/20 rounded-full blur-[130px] animate-blob mix-blend-screen" style={{ animationDelay: '4s' }} />
        </div>

        {/* --- FLOATING HEADER --- */}
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
          <nav className="pointer-events-auto flex items-center gap-4 p-2 pr-2 pl-5 rounded-full glass-panel transition-transform hover:scale-[1.01] duration-300">
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              aria-label={t.back}
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[14px]">{t.back}</span>
            </Link>

            <div className="w-px h-4 bg-white/10" aria-hidden="true" />

            {/* Language Toggle (Min size 13px for Accessibility) */}
            <div className="flex bg-black/40 rounded-full p-1 border border-white/5" role="group" aria-label="Language">
              <button 
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${lang === 'en' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLang('tr')}
                aria-pressed={lang === 'tr'}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${lang === 'tr' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Türkçe
              </button>
            </div>
          </nav>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32 md:py-40">
          
          {/* Hero Section */}
          <div className="text-center mb-12 animate-float">
            <div className="inline-flex items-center justify-center p-4 mb-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-[0_0_60px_-15px_rgba(79,70,229,0.15)]">
              <Shield size={40} className="text-indigo-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl md:text-4xl lg:text-8xl font-bold tracking-tight mb-1 text-gradient">
              {t.title}
            </h1>
          </div>

          {/* Grid Layout (Responsive) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {t.sections.map((section, idx) => (
              <article 
                key={section.id} 
                className={`
                  group relative flex flex-col p-8 rounded-[32px] glass-panel
                  hover:bg-white/[0.05] transition-all duration-500 hover:border-white/20
                  ${idx === 0 ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-500/5 to-transparent' : ''}
                `}
              >
                {/* Decorative Number */}
                <span 
                  className="absolute top-8 right-8 text-6xl md:text-7xl font-mono font-bold text-white/[0.03] group-hover:text-white/[0.07] transition-colors select-none pointer-events-none"
                  aria-hidden="true"
                >
                  {section.number}
                </span>

                <div className="mt-2 mb-6">
                  {/* Icons for specific sections */}
                  {idx === 0 && <Globe className="text-indigo-400 mb-5" size={32} strokeWidth={1.5} />}
                  {idx === 3 && <Lock className="text-emerald-400 mb-5" size={28} strokeWidth={1.5} />}
                  {idx === 4 && <Cpu className="text-blue-400 mb-5" size={28} strokeWidth={1.5} />}
                  
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-4">
                    {section.title}
                  </h2>
                  <p className="text-zinc-400 leading-relaxed text-[17px]">
                    {section.text}
                  </p>
                </div>

                {/* List Items */}
                {section.list && (
                  <ul className="mt-auto space-y-4 pt-6 border-t border-white/5">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px]">
                        <Check size={18} className="text-emerald-500 mt-1 shrink-0" />
                        <div>
                          <strong className="text-zinc-200 font-medium tracking-wide block mb-0.5">{item.label}</strong>
                          <span className="block text-zinc-500 leading-snug">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Subtext Box */}
                {section.subtext && (
                  <div className="mt-4 text-[13px] font-mono text-indigo-300/70 bg-indigo-500/[0.08] p-4 rounded-xl border border-indigo-500/10">
                    <span className="opacity-50 mr-2">{">"}</span> {section.subtext}
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-32 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 gap-6">
            <p>&copy; {new Date().getFullYear()} Namaz Vakti.</p>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs border border-white/10 px-3 py-1.5 rounded-lg bg-white/[0.02]">
                {t.updated}
              </span>
            </div>
          </footer>
        </main>

        {/* --- BACK TO TOP (Smooth Interaction) --- */}
        <button
          onClick={scrollToTop}
          className={`
            fixed bottom-8 right-8 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] 
            hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-black
            ${showTopBtn ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
          `}
          aria-label="Back to top"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </button>

      </div>
    </>
  );
}