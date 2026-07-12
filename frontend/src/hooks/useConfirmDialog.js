import { useState, useCallback, useRef } from 'react';

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Confirm');
  const resolveRef = useRef(null);

  const openDialog = useCallback((options = {}) => {
    setMessage(options.message || 'Are you sure?');
    setTitle(options.title || 'Confirm');
    setIsOpen(true);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const onConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
  }, []);

  const onCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  return {
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    openDialog,
    closeDialog,
  };
}

export default useConfirmDialog;
