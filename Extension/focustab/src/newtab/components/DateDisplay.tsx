import { useState, useEffect } from 'react';
import { formatDate } from '../../shared/date';
import styles from './DateDisplay.module.css';

export function DateDisplay() {
  const [d, setD] = useState(formatDate());
  useEffect(() => { const id = setInterval(() => setD(formatDate()), 60_000); return () => clearInterval(id); }, []);
  return <div className={styles.date}>{d}</div>;
}
