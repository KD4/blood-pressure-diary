import { useEffect } from 'react';
import { onBackEvent } from '@apps-in-toss/web-framework';

export function useBackEvent(handler: () => void) {
  useEffect(() => {
    const unsubscribe = onBackEvent(handler);
    return () => unsubscribe();
  }, [handler]);
}