import Image from "next/image";
import { Camera } from "lucide-react";
import { BACKGROUND_IMAGES } from "../utils/constants";

export default function Background({ bgImage, photoCredit, setImageError, t, language }) {
  return (
    <>
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="background"
          fill
          priority
          onError={() => setImageError(true)}
          className="object-cover object-center transition-all duration-1000 transform scale-110"
          quality={80}
        />
      </div>
      
      {/* Overlays */}
      <div className="absolute inset-0 z-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,220,100,0.12),transparent_55%)]" />

      {/* Photo Credit */}
      <div className="absolute bottom-2 right-2 z-20 flex flex-col items-end gap-1">
        {(photoCredit.author) && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/25 hover:bg-black/60 backdrop-blur-sm border border-white/5 rounded-full text-[9px] text-white/60 hover:text-white transition-all duration-300">
            <Camera size={11} />
            <span className="max-w-[110px] truncate font-light tracking-wide">
              {photoCredit.author || (language === "en" ? "Default" : "Varsayılan")}
            </span>
          </div>
        )}
      </div>
    </>
  );
}