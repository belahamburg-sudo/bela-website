"use client";

import { motion } from "framer-motion";

const CARDS = [
  { top: "8%", left: "62%", rotate: -12, delay: 0, label: "Kurs-Modul", sub: "AI Generated", color: "from-gold-500/20" },
  { top: "28%", left: "72%", rotate: 6, delay: 0.15, label: "Salespage", sub: "Live & Selling", color: "from-white/10" },
  { top: "52%", left: "58%", rotate: -5, delay: 0.3, label: "Checkout", sub: "Stripe Connected", color: "from-gold-300/15" },
  { top: "14%", left: "82%", rotate: 14, delay: 0.45, label: "Newsletter", sub: "1.2k Subscribers", color: "from-white/8" },
  { top: "68%", left: "76%", rotate: -9, delay: 0.6, label: "Revenue", sub: "€3.2k / mo", color: "from-gold-500/25" },
];

export default function ProductCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {CARDS.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30, rotate: card.rotate }}
          animate={{ opacity: 1, y: 0, rotate: card.rotate }}
          transition={{ delay: card.delay + 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ top: card.top, left: card.left, rotate: card.rotate }}
          className="absolute"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: "easeInOut", delay: i * 0.3 }}
            className={`rounded-xl border border-white/10 bg-gradient-to-br ${card.color} to-transparent backdrop-blur-md px-4 py-3 min-w-[140px] shadow-xl`}
          >
            <p className="text-xs font-semibold text-white/80">{card.label}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{card.sub}</p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
