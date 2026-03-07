import { useState } from 'react';
import { closeView } from '@apps-in-toss/web-framework';
import { ConfirmDialog } from '@toss/tds-mobile';
import { useBackEvent } from './useBackEvent';

export function useExitConfirm() {
  const [open, setOpen] = useState(false);

  useBackEvent(() => setOpen(true));

  const dialog = (
    <ConfirmDialog
      open={open}
      title="앱을 종료할까요?"
      confirmButton={
        <ConfirmDialog.ConfirmButton onClick={() => closeView()}>종료</ConfirmDialog.ConfirmButton>
      }
      cancelButton={
        <ConfirmDialog.CancelButton onClick={() => setOpen(false)}>취소</ConfirmDialog.CancelButton>
      }
    />
  );

  return { exitDialog: dialog };
}
