import { useEffect, useRef } from 'react';
import { showBannerAd, hideBannerAd } from '@apps-in-toss/web-framework';

export function useTossBanner(adId: string | undefined) {
  const shown = useRef(false);

  useEffect(() => {
    if (!adId || shown.current) return;
    shown.current = true;

    showBannerAd({ adId, position: 'bottom' }).catch(() => {
      // 광고 표시 실패 시 무시
    });

    return () => {
      hideBannerAd().catch(() => {});
    };
  }, [adId]);
}