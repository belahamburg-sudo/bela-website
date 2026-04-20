"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { CourseCard } from "@/components/course-card";
import { SectionHeading } from "@/components/section-heading";
import { featuredCourses } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const cards = section.querySelectorAll<HTMLElement>("[data-product-card]");
    const cta = section.querySelector<HTMLElement>("[data-cta]");

    gsap.fromTo(
      cards,
      { scale: 0.85, opacity: 0, filter: "blur(8px)" },
      {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 30%",
          scrub: 1
        }
      }
    );

    if (cta) {
      gsap.fromTo(
        cta,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cta,
            start: "top 90%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section || st.trigger === cta) st.kill();
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-28 sm:py-36">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Starter-Katalog"
          title={
            <>
              Mini-Kurse mit einem{" "}
              <span className="gold-text">klaren Ergebnis.</span>
            </>
          }
          copy="Jeder Kurs ist klein genug für schnelle Umsetzung und konkret genug, damit du weißt, was du bekommst."
        />

        <div className="mt-14 grid gap-7 lg:grid-cols-2">
          {featuredCourses.map((course) => (
            <div key={course.slug} data-product-card>
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        <div data-cta className="mt-10 text-center opacity-0">
          <Button href="/kurse" variant="outline" size="lg">
            Alle Kurse entdecken
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
