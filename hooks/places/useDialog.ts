// hooks/useDialog.ts
"use client";

import { useState, useCallback } from 'react';

export interface DialogOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const openDialog = useCallback((dialogOptions: DialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setOptions(dialogOptions);
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) {
      resolveRef(false);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef) {
      resolveRef(true);
      setResolveRef(null);
    }
  }, [resolveRef]);

  return {
    isOpen,
    options,
    openDialog,
    handleClose,
    handleConfirm
  };
}