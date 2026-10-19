import { useEffect, useRef, useState } from 'react';

export function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const style = getComputedStyle(element);
      setWidth(Math.max(200, Math.floor(element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}
