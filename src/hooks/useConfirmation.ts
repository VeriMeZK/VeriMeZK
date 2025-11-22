import { useState, useCallback } from 'react';

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning',
  });

  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      variant: 'danger' | 'warning' | 'info' = 'warning'
    ) => {
      setState({
        isOpen: true,
        title,
        message,
        onConfirm,
        variant,
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    state.onConfirm();
    setState(prev => ({ ...prev, isOpen: false }));
  }, [state]);

  const handleCancel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
