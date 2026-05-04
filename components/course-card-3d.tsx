"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CourseAsset } from "./course-asset";
import { Button } from "./button";
import { CheckoutButton } from "./checkout-button";
import { PlayCircle, Lock, Star, ChevronRight } from "lucide-react";
import { formatEuro } from "@/lib/utils";

type CourseCard3DProps = {
  course: any; // Using any for brevity, should ideally be typed
  isPurchased: boolean;
  levelColor?: string;
  isBundle?: boolean;
};

export function CourseCard3D({ course, isPurchased, levelColor, isBundle }: CourseCard3DProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX: rect.left;
    const mouseY = e.clientY: rect.top;

    const xPct = mouseX / width: 0.5;
    const yPct = mouseY / height: 0.5;

    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const getOrbProps = () => {
    if (isBundle) return { color: "#FFFFFF", speed: 2, distort: 0.2 };
    
    switch (course.level?.toLowerCase()) {
      case 'start': return { color: "#10B981", speed: 0.8, distort: 0.3 };
      case 'aufbau': return { color: "#3B82F6", speed: 1.2, distort: 0.5 };
      case 'system': return { color: "#8B5CF6", speed: 1.5, distort: 0.7 };
      default: return { color: "#10B981", speed: 1, distort: 0.4 };
    }
  };

  const orbProps = getOrbProps();

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[320px] rounded-2xl group transition-all duration-500"
    >
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-300/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card Body */}
      <div 
        style={{ transform: "translateZ(50px)" }}
        className={`relative h-full w-full bg-ink/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col overflow-hidden ${
          isBundle ? "border-gold-300/30" : ""
        }`}
      >
        {/* 3D Asset Background */}
        <div className="absolute -right-16 -top-16 w-64 h-64 opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <CourseAsset className="w-full h-full" {...orbProps} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <span className={`inline-block text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 border ${levelColor || 'border-white/10 text-white/40'}`}>
              {course.level?.toUpperCase() || 'MODUL'}
            </span>
            {isBundle && <Star className="h-4 w-4 text-gold-300 fill-gold-300/20" />}
          </div>

          <h3 className="mt-4 font-heading text-2xl text-cream tracking-tight leading-tight max-w-[80%] group-hover:text-gold-300 transition-colors">
            {course.title}
          </h3>
          <p className="mt-2 text-[10px] font-mono text-cream/30 uppercase tracking-widest line-clamp-2">
            {course.tagline}
          </p>

          <div className="mt-auto pt-6 flex items-center justify-between gap-4">
            {isPurchased ? (
              <>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{course.progress}% Fortschritt</span>
                  </div>
                  <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      className="h-full bg-gold-300"
                    />
                  </div>
                </div>
                <Button 
                  href={`/dashboard/kurse/${course.slug}`}
                  variant="ghost"
                  className="p-2 h-10 w-10 rounded-full border border-gold-300/20 hover:bg-gold-300 hover:text-ink transition-all"
                >
                  <PlayCircle className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <span className="font-heading text-xl text-gold-300/80">
                  {formatEuro(course.price_cents)}
                </span>
                <CheckoutButton 
                  courseSlug={course.slug} 
                  label="Zugang anfordern"
                  className="bg-gold-300 text-ink hover:bg-white transition-colors py-2 px-6 rounded-none font-bold text-[10px] uppercase tracking-widest"
                />
              </>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}
