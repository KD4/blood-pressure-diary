import { useState, useCallback } from 'react';
import { closeView } from '@apps-in-toss/web-framework';
import { ConfirmDialog } from '@toss/tds-mobile';

/**
 * 종료 확인 다이얼로그 상태를 관리하는 훅
 * useBackEvent와 조합하여 사용:
 *   const { openExitDialog, ExitConfirmDialog } = useExitConfirm();
 *   useBackEvent(openExitDialog);
 */
export function useExitConfirm() {
  const [open, setOpen] = useState(false);

  const openExitDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const ExitConfirmDialog = useCallback(() => (
    <ConfirmDialog
      open={open}
      title="혈압다이어리를 종료할까요?"
      onClose={() => setOpen(false)}
      cancelButton={
        <ConfirmDialog.CancelButton onClick={() => setOpen(false)}>
          취소
        </ConfirmDialog.CancelButton>
      }
      confirmButton={
        <ConfirmDialog.ConfirmButton onClick={() => closeView()}>
          종료하기
        </ConfirmDialog.ConfirmButton>
      }
    />
  ), [open]);

  return { openExitDialog, ExitConfirmDialog };
}
