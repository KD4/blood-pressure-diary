import { useCallback } from 'react';
import { showInterstitialAd } from '@apps-in-toss/web-framework';

export function useInterstitialAd(adId: string | undefined) {
  const show = useCallback(async () => {
    if (!adId) return;
    try {
      await showInterstitialAd({ adId });
    } catch {
      // 광고 표시 실패 시 무시
    }
  }, [adId]);

  return { showAd: show };
}