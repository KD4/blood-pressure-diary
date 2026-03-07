import { useEffect } from 'react';
import { graniteEvent } from '@apps-in-toss/web-framework';

export function useBackEvent(handler: () => void) {
  useEffect(() => {
    const unsubscribe = graniteEvent.addEventListener('backEvent', {
      onEvent: handler,
    });
    return () => unsubscribe();
  }, [handler]);
}
