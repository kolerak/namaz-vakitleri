import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const abortControllerRef = useRef(null); 
  const wrapperRef = useRef(null);
  
  const { language, t } = useSettings();

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length > 2) {
      setIsLoading(true);
      setIsOpen(true);
      setResults([]); // Eski sonuçları temizle
    } else {
      setIsLoading(false);
      setIsOpen(false);
      setResults([]);
    }
  };

  useEffect(() => {
    if (query.length <= 2) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&accept-language=${language}&addressdetails=1`,
          { signal }
        );

        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        const cleanedResults = data.map(item => {
          const addr = item.address;
          let mainName = addr.city || addr.town || addr.district || addr.province || addr.state || item.name;
          let parentName = addr.state || addr.province || addr.region;
          
          let displayName = mainName;
          if (parentName && parentName !== mainName) displayName += `, ${parentName}`;
          if (addr.country) displayName += `, ${addr.country}`;

          return { ...item, clean_name: displayName, raw_name: mainName };
        });

        const uniqueResults = cleanedResults.filter(
          (item, index, self) => index === self.findIndex((t) => t.clean_name === item.clean_name)
        );

        setResults(uniqueResults);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Search error:", error);
          setResults([]);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);

  }, [query, language]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (e, item) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    onSelectCity({ name: item.raw_name, lat: item.lat, lng: item.lon });
    setQuery(item.clean_name);
    setIsOpen(false);
    setIsLoading(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full z-50">
      <div className="relative group">
        <input 
          type="text" 
          value={query} 
          onChange={handleInputChange} 
          onFocus={() => { if(query.length > 2) setIsOpen(true); }} 
          placeholder={t.cityPlaceholder} 
          className="w-full bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-white placeholder-gray-500 shadow-sm" 
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {isLoading ? <Loader2 className="animate-spin text-yellow-500" size={18} /> : <Search size={18} />}
        </div>
      </div>
      
      {/* DROPDOWN ALANI */}
      {isOpen && query.length > 2 && (
        <div className="absolute w-full bg-gray-900/95 border border-gray-700/50 backdrop-blur-md rounded-xl mt-2 max-h-60 overflow-y-auto shadow-2xl z-50 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent animate-in fade-in zoom-in-95 duration-200">
          <ul className="py-1">
            
            {/* 1. DURUM: YÜKLENİYORSA (SKELETON GÖSTER) */}
            {isLoading ? (
              <div className="px-2 py-2 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-700/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              
              /* 2. DURUM: SONUÇ VARSA LİSTELE */
              results.map((item) => (
                <li key={item.place_id} className="border-b border-gray-700/30 last:border-0">
                  <button 
                    onMouseDown={(e) => handleSelect(e, item)} 
                    className="w-full text-left px-4 py-3 hover:bg-gray-700/50 cursor-pointer flex items-start gap-3 transition-colors group" 
                    type="button"
                  >
                    <MapPin size={16} className="mt-1 text-gray-500 group-hover:text-yellow-500 transition-colors shrink-0" />
                    <span className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">{item.clean_name}</span>
                  </button>
                </li>
              ))
            ) : (
              
              /* 3. DURUM: SONUÇ YOKSA */
              <li className="p-6 text-center text-gray-400 flex flex-col items-center gap-2">
                  <AlertCircle size={24} className="text-gray-500/50" />
                  <span className="text-sm font-medium text-gray-400">{t.cityDetectFailed || "Şehir bulunamadı"}</span>
              </li>
            )}

          </ul>
        </div>
      )}
    </div>
  );
}