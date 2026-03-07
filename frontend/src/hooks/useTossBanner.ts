import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';

export function useTossBanner(adId: string | undefined) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!adId || !containerRef.current) return;

    try {
      TossAds.attachBanner?.(adId, containerRef.current);
    } catch {
      // 광고 표시 실패 시 무시
    }

    return () => {
      try {
        TossAds.destroyAll?.();
      } catch {
        // 무시
      }
    };
  }, [adId]);

  return { containerRef };
}
