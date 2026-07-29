'use client';

// Модалка: Escape, lock scroll; ConfirmModal — да/нет
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { Spinner } from '@/components/motion/spinner';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
};

export function Modal({
  open,
  onClose,
  children,
  className = '',
  labelledBy,
}: ModalProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    // Блокируем скролл фона на время открытия
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-5 shadow-xl ${className}`}
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{
              duration: reduce ? 0.15 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
};

// Диалог подтверждения опасного действия
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  danger = false,
  pending = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onClose}
      labelledBy="confirm-modal-title"
    >
      {' '}
      <h2
        id="confirm-modal-title"
        className="text-lg font-semibold text-foreground"
      >
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-hover disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className={
            danger
              ? 'inline-flex items-center gap-2 rounded-md border border-red-300/60 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 disabled:opacity-60 dark:text-red-400'
              : 'inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60'
          }
        >
          {pending && <Spinner />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
