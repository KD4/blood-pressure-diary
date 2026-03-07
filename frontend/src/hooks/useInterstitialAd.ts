import { useCallback } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

export function useInterstitialAd(_adId: string | undefined) {
  const show = useCallback(async () => {
    if (!_adId) return;
    try {
      await new Promise<void>((resolve, reject) => {
        loadFullScreenAd({
          onEvent: () => resolve(),
          onError: (err) => reject(err),
        });
      });
      await new Promise<void>((resolve, reject) => {
        showFullScreenAd({
          onEvent: () => resolve(),
          onError: (err) => reject(err),
        });
      });
    } catch {
      // 광고 표시 실패 시 무시
    }
  }, [_adId]);

  return { showAd: show };
}
