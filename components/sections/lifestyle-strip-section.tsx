"use client";

import Image from "next/image";

const PHOTOS = [
  { src: "/assets/bela-golf-2.jpeg", alt: "Bela beim Golf", label: "München" },
  { src: "/assets/bela-seoul.jpg", alt: "Remote — Seoul", label: "Seoul" },
  { src: "/assets/bela-terrace.jpg", alt: "Abend am Wasser", label: "Istanbul" },
  { src: "/assets/bela-golf-1.jpeg", alt: "Bela beim Golf", label: "München" },
];

export function LifestyleStripSection() {
  return (
    <section className="relative bg-obsidian">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {PHOTOS.map((photo, i) => (
          <div key={i} className="relative aspect-[2/3] overflow-hidden group">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {/* Dark overlay to match brand */}
            <div className="absolute inset-0 bg-obsidian/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />
            {/* Location label */}
            <span className="absolute bottom-4 left-4 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-cream/35">
              {photo.label}
            </span>
            {/* Gold corner accent on hover */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-gold-300/0 group-hover:border-gold-300/50 transition-all duration-500" />
          </div>
        ))}
      </div>
    </section>
  );
}
