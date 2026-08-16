import { useEffect, useRef, useState } from 'react';

/**
 * Port of the `[data-count]` counter animation: eases from 0 to `end` over
 * 1400ms the first time the element is 60% visible, then appends `suffix`.
 */
export function useCounter(end, suffix = '', duration = 1400) {
  const ref = useRef(null);
  const [text, setText] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          io.unobserve(en.target);

          let t0 = null;
          const step = (ts) => {
            if (!t0) t0 = ts;
            const p = Math.min((ts - t0) / duration, 1);
            setText(Math.floor(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : ''));
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        });
      },
      { threshold: 0.6 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [end, suffix, duration]);

  return [ref, text];
}
