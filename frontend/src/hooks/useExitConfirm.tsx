import { useState } from 'react';
import { exitApp } from '@apps-in-toss/web-framework';
import { ConfirmDialog } from '@toss/tds-mobile';
import { useBackEvent } from './useBackEvent';

export function useExitConfirm() {
  const [open, setOpen] = useState(false);

  useBackEvent(() => setOpen(true));

  const dialog = open ? (
    <ConfirmDialog title="앱을 종료할까요?">
      <ConfirmDialog.CancelButton onClick={() => setOpen(false)}>취소</ConfirmDialog.CancelButton>
      <ConfirmDialog.ConfirmButton onClick={() => exitApp()}>종료</ConfirmDialog.ConfirmButton>
    </ConfirmDialog>
  ) : null;

  return { exitDialog: dialog };
}