// Illustrated gold-mine sunset behind the hero (GTA cover style, brown/black/gold).
// Pure SVG, no image request. Bottom fades into #0a0806 so the next section joins seamlessly.
export function MineSceneBackground() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-1/2 h-auto w-[max(100%,900px)] -translate-x-1/2"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="mine-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0806" />
          <stop offset=".38" stopColor="#1c120a" />
          <stop offset=".58" stopColor="#3d2510" />
          <stop offset=".72" stopColor="#7a4a18" />
          <stop offset=".8" stopColor="#c98a2e" />
          <stop offset=".86" stopColor="#e8bd62" />
        </linearGradient>
        <linearGradient id="mine-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc9a" />
          <stop offset="1" stopColor="#c98a2e" />
        </linearGradient>
        <linearGradient id="mine-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0806" stopOpacity="0" />
          <stop offset="1" stopColor="#0a0806" />
        </linearGradient>
        <mask id="mine-sun-stripes">
          <rect width="1440" height="900" fill="#fff" />
          <rect y="640" width="1440" height="5" fill="#000" />
          <rect y="660" width="1440" height="7" fill="#000" />
          <rect y="682" width="1440" height="9" fill="#000" />
          <rect y="706" width="1440" height="11" fill="#000" />
        </mask>
      </defs>

      <rect width="1440" height="900" fill="url(#mine-sky)" />
      <circle cx="250" cy="690" r="160" fill="url(#mine-sun)" mask="url(#mine-sun-stripes)" opacity=".75" />

      {/* Mountain layers */}
      <path d="M0 670 L140 590 L260 630 L420 540 L560 620 L700 575 L860 640 L1010 555 L1160 620 L1300 570 L1440 630 V900 H0Z" fill="#5a3818" opacity=".85" />
      <path d="M0 720 L180 650 L330 700 L520 635 L700 710 L880 660 L1080 720 L1260 670 L1440 710 V900 H0Z" fill="#3a2410" />

      {/* Headframe */}
      <g stroke="#1a1008" strokeWidth="11" strokeLinecap="square" fill="none">
        <path d="M1130 770 L1200 470 L1270 770" />
        <path d="M1200 470 L1335 770" />
        <path d="M1150 680 L1250 680 M1165 600 L1235 600 M1180 530 L1220 530" />
        <path d="M1200 470 L1390 640" />
      </g>
      <circle cx="1200" cy="460" r="38" fill="none" stroke="#1a1008" strokeWidth="9" />
      <path d="M1200 422 V498 M1162 460 H1238 M1173 433 L1227 487 M1227 433 L1173 487" stroke="#1a1008" strokeWidth="4" />
      <path d="M1290 750 h190 v-90 l-95 -40 l-95 40z" fill="#1a1008" />
      <rect x="1325" y="690" width="26" height="22" fill="#e8bd62" />
      <rect x="1410" y="690" width="26" height="22" fill="#e8bd62" opacity=".7" />

      {/* Ground + rails */}
      <path d="M0 770 Q720 735 1440 775 V900 H0Z" fill="#24170b" />
      <path d="M0 820 Q720 790 1440 825 V900 H0Z" fill="#140d07" />
      <g stroke="#0a0806" strokeWidth="5">
        <path d="M-20 890 L420 800" />
        <path d="M60 920 L490 810" />
      </g>

      {/* Mine cart with gold */}
      <g transform="translate(360 735)">
        <circle cx="20" cy="40" r="17" fill="#b07a2a" />
        <circle cx="55" cy="22" r="22" fill="#c9a961" />
        <circle cx="95" cy="30" r="19" fill="#e8bd62" />
        <circle cx="130" cy="40" r="15" fill="#b07a2a" />
        <path d="M-10 45 H170 L150 120 H10Z" fill="#1a1008" />
        <path d="M-10 45 H170 L166 60 H-6Z" fill="#4a2e14" />
        <circle cx="35" cy="128" r="16" fill="#0a0806" />
        <circle cx="125" cy="128" r="16" fill="#0a0806" />
      </g>

      {/* Miner */}
      <g transform="translate(200 560)" fill="#1a1008">
        <path d="M40 0 Q75 -6 92 22 L96 34 H-4 L0 22 Q12 -2 40 0Z" />
        <circle cx="46" cy="34" r="6" fill="#e8bd62" />
        <circle cx="46" cy="52" r="24" />
        <path d="M10 82 Q46 66 84 82 L96 200 L70 200 L66 330 L40 330 L36 210 L26 330 L0 330 L4 200 L-4 200Z" />
        <path d="M84 90 L120 170 L104 178 L76 120Z" />
      </g>

      <rect y="600" width="1440" height="300" fill="url(#mine-fade)" />
    </svg>
  );
}
