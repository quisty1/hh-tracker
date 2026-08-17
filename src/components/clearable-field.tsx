'use client';

// Input / textarea with a clear-value button
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const clearBtnClass =
  'absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted transition hover:bg-hover hover:text-foreground';

type ClearableInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
};

export function ClearableInput({
  value,
  onChange,
  className = '',
  inputClassName = '',
  disabled,
  ...props
}: ClearableInputProps) {
  const reduce = useReducedMotion();
  const showClear = Boolean(value) && !disabled;

  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClassName} ${showClear ? 'pr-9' : ''}`}
      />
      <AnimatePresence>
        {showClear && (
          <motion.button
            type="button"
            aria-label="Очистить"
            className={clearBtnClass}
            onClick={() => onChange('')}
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            ×
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

type ClearableTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> & {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
};

export function ClearableTextarea({
  value,
  onChange,
  className = '',
  inputClassName = '',
  disabled,
  ...props
}: ClearableTextareaProps) {
  const reduce = useReducedMotion();
  const showClear = Boolean(value) && !disabled;

  return (
    <div className={`relative ${className}`}>
      <textarea
        {...props}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClassName} ${showClear ? 'pr-9' : ''}`}
      />
      <AnimatePresence>
        {showClear && (
          <motion.button
            type="button"
            aria-label="Очистить"
            className="absolute right-2 top-2 flex size-6 items-center justify-center rounded text-muted transition hover:bg-hover hover:text-foreground"
            onClick={() => onChange('')}
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            ×
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
