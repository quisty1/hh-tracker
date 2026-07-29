'use client';

// Число с пружинной анимацией счётчика (KPI)
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect } from 'react';

type AnimatedNumberProps = {
  value: number;
  className?: string;
};

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? value : 0);
  const spring = useSpring(motionValue, {
    stiffness: 90,
    damping: 22,
    mass: 0.8,
  });
  // Округление + ru-локаль для отображения
  const display = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString('ru-RU'),
  );

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  if (reduce) {
    return <span className={className}>{value.toLocaleString('ru-RU')}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}
