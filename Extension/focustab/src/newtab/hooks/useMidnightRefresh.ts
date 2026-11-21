import { useEffect, useRef } from 'react';
import { getMsUntilMidnight, getLocalDateKey } from '../../shared/date';

export function useMidnightRefresh(callback: () => void) {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => {
    let lastKey = getLocalDateKey();
    let timer: ReturnType<typeof setTimeout>;

    function check() {
      const cur = getLocalDateKey();
      if (cur !== lastKey) { lastKey = cur; ref.current(); }
    }

    function schedule() {
      timer = setTimeout(() => { check(); schedule(); }, getMsUntilMidnight() + 1000);
    }

    schedule();
    const interval = setInterval(check, 60_000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);
}
