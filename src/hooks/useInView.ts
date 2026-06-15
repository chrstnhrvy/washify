import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll helper. Returns a ref to attach to the element and an
 * `inView` flag that flips true the first time the element enters the viewport
 * (and stays true). Users who prefer reduced motion are shown content
 * immediately, with no animation.
 */
export function useInView<T extends HTMLElement = HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
