import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, AlertCircle } from 'lucide-react'; // AlertCircle ikonunu ekledik
import { useSettings } from '../context/SettingsContext';

export default function CitySearch({ onSelectCity, placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { language } = useSettings();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=10&accept-language=${language}&addressdetails=1`);
          const data = await res.json();
          const cleanedResults = data.map(item => {
            const addr = item.address;
            let mainName = addr.city || addr.town || addr.province || addr.state || addr.county || item.name;
            let parentName = addr.state || addr.province || addr.region;
            let displayName = mainName;
            if (parentName && parentName !== mainName) displayName += `, ${parentName}`;
            if (addr.country) displayName += `, ${addr.country}`;
            return { ...item, clean_name: displayName, raw_name: mainName };
          });
          const uniqueResults = cleanedResults.filter((item, index, self) => index === self.findIndex((t) => (t.clean_name === item.clean_name)));
          setResults(uniqueResults);
          setIsOpen(true);
        } catch (error) { console.error("Arama hatası:", error); } finally { setIsLoading(false); }
      } else { setResults([]); setIsOpen(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, language]);

  useEffect(() => {
    function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (e, item) => {
    e.preventDefault(); e.stopPropagation();
    onSelectCity({ name: item.raw_name, lat: item.lat, lng: item.lon });
    setQuery(item.clean_name); setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-[60]">
      <div className="relative">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => { if(query.length > 2) setIsOpen(true); }} placeholder={placeholder} className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition text-white" />
        <div className="absolute left-3 top-3.5 text-gray-400">{isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}</div>
      </div>
      
      {isOpen && (
        <ul className="absolute w-full bg-gray-800 border border-gray-700 rounded-xl mt-2 max-h-60 overflow-y-auto shadow-2xl z-[70]">
          {/* SONUÇ VARSA LİSTELE */}
          {results.length > 0 ? (
            results.map((item) => (
              <li key={item.place_id} className="border-b border-gray-700 last:border-0">
                <button onMouseDown={(e) => handleSelect(e, item)} className="w-full text-left px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-start gap-3 transition" type="button">
                  <MapPin size={16} className="mt-1 text-yellow-500 shrink-0" /><span className="text-sm text-gray-200 font-medium">{item.clean_name}</span>
                </button>
              </li>
            ))
          ) : (
            // SONUÇ YOKSA UYARI GÖSTER (Yüklenmiyor ve query uzunsa)
            !isLoading && query.length > 2 && (
                <li className="p-4 text-center text-gray-400 flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="text-red-400" />
                    <span className="text-sm">Şehir bulunamadı.</span>
                </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}