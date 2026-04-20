"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Faq } from "@/components/faq";
import { SectionHeading } from "@/components/section-heading";
import { faqItems } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    gsap.fromTo(
      section,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-28 opacity-0 sm:py-36">
      <div className="container-narrow">
        <SectionHeading
          align="center"
          eyebrow="Fragen & Antworten"
          title="Bevor du fragst."
        />
        <div className="mt-14">
          <Faq items={faqItems} />
        </div>
      </div>
    </section>
  );
}
