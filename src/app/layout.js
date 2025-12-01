import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- 1. GÖRÜNÜM AYARLARI (VIEWPORT) ---
// Next.js 14'te viewport artık ayrı bir obje olarak dışarı aktarılır.
// Bu, mobil uyumluluk ve tarayıcı çubuğu rengi (siyah) içindir.
export const viewport = {
  themeColor: 'black',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Zoom'a izin ver
  // userScalable: false, // BU SATIRI SİL VEYA TRUE YAP
};
// --- 2. SEO VE META AYARLARI ---
export const metadata = {
  metadataBase: new URL('https://namaz-vakti.vercel.app'), // Buraya kendi Vercel linkini koyacaksın (Deploy edince)
  description: "Konumunuza özel en hassas namaz vakitleri...",
  title: {
    default: "Namaz Vakti - Modern Ezan Saatleri",
    template: "%s | Namaz Vakti" // Sayfa içinde başlık değişirse sonuna bunu ekler
  },
  
  description: "Konumunuza özel en hassas namaz vakitleri. Otomatik şehir bulma, iftar ve sahur sayacı, modern tasarım ve bildirim özelliği.",
  
  applicationName: "Namaz Vakti",
  authors: [{ name: "Senin Adın", url: "https://github.com/kolerak" }],
  keywords: ["namaz", "vakitler", "ezan", "imsak", "iftar", "sahur", "kıble", "diyanet", "namaz saatleri"],
  
  // Robotlar (Google Botları) için izinler
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Sosyal Medya Paylaşım Kartları (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    title: "Namaz Vakti - Modern Ezan Saatleri",
    description: "Hassas namaz vakitleri, otomatik konum ve bildirim özelliği.",
    url: 'https://namaz-vakti.vercel.app',
    siteName: 'Namaz Vakti',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/android-chrome-512x512.png', // Paylaşınca çıkacak büyük resim
        width: 512,
        height: 512,
        alt: 'Namaz Vakti Uygulaması',
      },
    ],
  },

  // Twitter Kartları
  twitter: {
    card: 'summary_large_image',
    title: "Namaz Vakti",
    description: "Vaktinde kılınan namaz huzurdur. Modern namaz vakti uygulaması.",
    images: ['/android-chrome-512x512.png'], // Twitter'da çıkacak resim
  },

  // İkonlar ve Manifest Bağlantısı
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body 
        className={inter.className}
      >
        {children}
      </body>
    </html>
  );
}