"use client";

import { useEffect } from "react";

export function PitchScrollEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(".pitch-reveal, .pitch-stagger > *"));
    const slideTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-pitch-section]"));
    const dotTargets = Array.from(document.querySelectorAll<HTMLAnchorElement>(".pitch-dot"));
    const progressBar = document.querySelector<HTMLElement>(".pitch-progress");

    document.documentElement.classList.add("pitch-enhanced");

    const setActiveSlide = (slideId: string) => {
      dotTargets.forEach((dot) => {
        dot.classList.toggle("is-active", dot.dataset.slideId === slideId);
      });
    };

    const updateProgress = () => {
      if (!progressBar) return;

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    };

    setActiveSlide(slideTargets[0]?.id || "hero");

    if (reduceMotion) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      updateProgress();
      window.addEventListener("scroll", updateProgress, { passive: true });
      return () => {
        window.removeEventListener("scroll", updateProgress);
        document.documentElement.classList.remove("pitch-enhanced");
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 }
    );

    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target instanceof HTMLElement) {
          setActiveSlide(visibleEntry.target.id);
        }
      },
      { rootMargin: "-28% 0px -42% 0px", threshold: [0.18, 0.35, 0.55] }
    );

    revealTargets.forEach((target) => observer.observe(target));
    slideTargets.forEach((target) => activeObserver.observe(target));
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      observer.disconnect();
      activeObserver.disconnect();
      window.removeEventListener("scroll", updateProgress);
      document.documentElement.classList.remove("pitch-enhanced");
    };
  }, []);

  return <div className="pitch-progress" aria-hidden="true" />;
}
