import { useMemo } from 'react';
import { useStorage } from '../hooks/useStorage';
import { getTimeBand, getGreetingWord } from '../../shared/date';
import styles from './Greeting.module.css';

export function Greeting() {
  const [profile] = useStorage('profile');
  const greeting = useMemo(() => {
    const word = getGreetingWord(getTimeBand(new Date().getHours()));
    const name = profile?.displayName?.trim();
    return name ? `${word}, ${name}` : 'Welcome';
  }, [profile]);
  return <h1 className={styles.greeting}>{greeting}</h1>;
}
