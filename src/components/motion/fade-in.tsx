'use client';

// Появление/исчезновение блока с opacity + сдвиг по Y
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type FadeInProps = {
  show: boolean;
  children: ReactNode;
  className?: string;
  y?: number;
};

export function FadeIn({ show, children, className, y = 6 }: FadeInProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className={className}
          initial={reduce ? false : { opacity: 0, y }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
