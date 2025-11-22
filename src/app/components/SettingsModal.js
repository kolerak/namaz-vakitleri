import React from 'react';
import { Settings, MapPin, Bell, BellOff, X, Check } from 'lucide-react'; // BellOff ve Check eklendi
import { useSettings } from '../context/SettingsContext';
import CitySearch from './CitySearch';

const SettingsModal = ({ isOpen, onClose, onAutoLocation }) => {
  const { language, setLanguage, setCity, setCoords, t, notificationsEnabled, setNotificationsEnabled } = useSettings();

  if (!isOpen) return null;

  const handleCitySelect = (selectedData) => {
    setCity(selectedData.name);
    setCoords({
      lat: parseFloat(selectedData.lat),
      lng: parseFloat(selectedData.lng)
    });
    onClose(); 
  };

  // Bildirim İzni İsteme Fonksiyonu
  const toggleNotifications = () => {
    // Eğer zaten açıksan kapat
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }

    // Tarayıcı desteği kontrolü
    if (!("Notification" in window)) {
      alert("Tarayıcınız bildirimleri desteklemiyor.");
      return;
    }

    // İzin iste
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationsEnabled(true);
        // Test bildirimi gönder
        new Notification("Bismillah!", {
          body: "Bildirimler başarıyla açıldı. Namaz vakitlerinde haber vereceğim.",
          icon: "/icon.png"
        });
      } else {
        alert("Bildirim izni reddedildi. Tarayıcı ayarlarından izin vermelisiniz.");
        setNotificationsEnabled(false);
      }
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-700 relative flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="text-yellow-400" /> {t.settings}
          </h2>
          <button onClick={onClose} aria-label="Ayarları Kapat" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"><X size={20} /></button>
        </div>

        <div className="space-y-6 overflow-visible pr-2">
          {/* Dil Seçimi */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t.language}</label>
            <div className="flex gap-2">
              {['tr', 'en', 'ar'].map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`flex-1 py-2 rounded-xl border transition ${language === lang ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : 'border-gray-600 hover:bg-gray-800'}`}>{lang.toUpperCase()}</button>
              ))}
            </div>
          </div>

          {/* Konum Seçimi */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t.location}</label>
            <div className="mb-3 relative z-50">
              <CitySearch placeholder={t.cityPlaceholder} onSelectCity={handleCitySelect} />
            </div>
            
            <div className="flex items-center justify-center my-2 text-gray-500 text-xs">- VEYA -</div>

            <button onClick={() => { onAutoLocation(); onClose(); }} className="w-full flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 py-3 rounded-xl hover:bg-blue-600/30 transition">
              <MapPin size={18} /> {t.autoLocation}
            </button>
          </div>

          {/* BİLDİRİMLER (AKTİF) */}
          <div className="pt-4 border-t border-gray-800">
             <label className="block text-sm text-gray-400 mb-2">{t.notifications || "Bildirimler"}</label>
             <button 
                onClick={toggleNotifications}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition border ${
                  notificationsEnabled 
                    ? 'bg-green-900/30 border-green-500/50 text-green-400' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
             >
                <div className="flex items-center gap-3">
                  {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                  <span className="font-medium">{notificationsEnabled ? "Bildirimler Açık" : "Bildirimleri Aç"}</span>
                </div>
                
                {/* Switch Animasyonu */}
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${notificationsEnabled ? 'left-6' : 'left-1'}`}></div>
                </div>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;