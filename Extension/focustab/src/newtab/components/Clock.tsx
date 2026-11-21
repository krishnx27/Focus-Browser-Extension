import { useState, useEffect } from 'react';
import { formatTime12h } from '../../shared/date';
import styles from './Clock.module.css';

export function Clock() {
  const [time, setTime] = useState(formatTime12h());

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime12h()), 1000);
    return () => clearInterval(id);
  }, []);

  return <div className={styles.clock}>{time}</div>;
}
