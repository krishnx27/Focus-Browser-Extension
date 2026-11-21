import { useState, useEffect } from 'react';
import { useStorage } from './hooks/useStorage';
import { getWallpaperBlob } from '../shared/wallpaperDb';
import { DEFAULT_WALLPAPER_URL } from '../shared/defaults';
import styles from './components/WallpaperBackground.module.css';

const FALLBACK = 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';

export function WallpaperBackground({ children }: { children: React.ReactNode }) {
  const [wp] = useStorage('wallpaper');
  const [ui] = useStorage('ui');
  const [bg, setBg] = useState(FALLBACK);

  useEffect(() => {
    let url: string | null = null;
    (async () => {
      if (wp?.kind === 'uploaded') {
        try {
          const blob = await getWallpaperBlob();
          if (blob) { url = URL.createObjectURL(blob); setBg(`url(${url})`); return; }
        } catch { /* fall through */ }
      }
      if (wp?.kind === 'remote-default' && wp.url) {
        const img = new Image();
        img.onload = () => setBg(`url(${wp.url})`);
        img.onerror = () => setBg(FALLBACK);
        img.src = wp.url;
        return;
      }
      setBg(FALLBACK);
    })();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [wp]);

  return (
    <div className={styles.wallpaper} style={{ backgroundImage: bg }}>
      <div className={styles.overlay} style={{ opacity: ui?.overlayStrength ?? 0.45 }} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
