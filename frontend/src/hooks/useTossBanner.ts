import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';

export function useTossBanner(adId: string | undefined) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!adId || !containerRef.current) return;

    const container = containerRef.current;
    let bannerResult: { destroy(): void } | null = null;

    try {
      TossAds.initialize?.({
        callbacks: {
          onInitialized: () => {
            try {
              bannerResult = TossAds.attachBanner?.(adId, container) ?? null;
            } catch {
              // 배너 부착 실패 시 무시
            }
          },
          onInitializationFailed: () => {
            // 초기화 실패 시 무시
          },
        },
      });
    } catch {
      // 초기화 호출 실패 시 무시
    }

    return () => {
      try {
        bannerResult?.destroy();
      } catch {
        // 무시
      }
      try {
        TossAds.destroyAll?.();
      } catch {
        // 무시
      }
    };
  }, [adId]);

  return { containerRef };
}
