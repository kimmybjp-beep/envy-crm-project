"use client";

import { useEffect } from "react";

export function PitchScrollEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>(".pitch-reveal, .pitch-stagger > *"));
    const progressBar = document.querySelector<HTMLElement>(".pitch-progress");

    document.documentElement.classList.add("pitch-enhanced");

    const updateProgress = () => {
      if (!progressBar) return;

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    };

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

    revealTargets.forEach((target) => observer.observe(target));
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      document.documentElement.classList.remove("pitch-enhanced");
    };
  }, []);

  return <div className="pitch-progress" aria-hidden="true" />;
}
