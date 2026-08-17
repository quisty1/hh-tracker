'use client';

// Button / link with a light scale on hover and tap
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

type PressableProps = {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
} & Omit<HTMLMotionProps<'button'>, 'children' | 'className'>;

export function Pressable({
  children,
  className,
  type = 'button',
  ...props
}: PressableProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type={type}
      className={className}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

type PressableLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
} & Omit<HTMLMotionProps<'a'>, 'children' | 'className' | 'href'>;

export function PressableLink({
  children,
  className,
  href,
  ...props
}: PressableLinkProps) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={href}
      className={className}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      {...props}
    >
      {children}
    </motion.a>
  );
}
