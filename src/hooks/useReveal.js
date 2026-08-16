import { useEffect, useRef } from 'react';

/**
 * Port of the original IntersectionObserver that added `.in` to `.reveal`
 * elements once they scrolled into view. Attach the returned ref to any
 * element that carries the `reveal` class:
 *
 *   const ref = useReveal();
 *   <div ref={ref} className="reveal …">
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already revealed (e.g. re-mounted after a language switch) — skip.
    if (el.classList.contains('in')) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}
