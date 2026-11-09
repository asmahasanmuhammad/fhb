"use client";

import { useEffect } from "react";

/**
 * Scroll-reveal: observes every `.reveal` element and adds `.is-visible`
 * as it enters the viewport. A MutationObserver catches elements that
 * mount later (e.g. after data loads), and a safety timeout force-shows
 * everything after 1s so no section can ever get stuck hidden.
 * Mount once per view at the top level.
 */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.04 }
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((el) => {
          if (!el.dataset.revealObserved) {
            el.dataset.revealObserved = "1";
            io.observe(el);
          }
        });
    };

    observeAll();

    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety net — nothing stays hidden longer than 1s
    const safety = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
        .forEach((el) => el.classList.add("is-visible"));
    }, 1000);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(safety);
    };
  }, []);
}
