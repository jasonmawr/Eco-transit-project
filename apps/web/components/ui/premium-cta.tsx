'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface PremiumCtaProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  glowColor?: string;
}

export function PremiumCta({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  variant = 'primary',
  glowColor = 'rgba(0, 102, 255, 0.4)',
}: PremiumCtaProps) {
  const shouldReduceMotion = useReducedMotion();

  // Scale animation for hover/tap, respecting reduced motion
  const hoverScale = shouldReduceMotion ? 1 : 1.025;
  const tapScale = shouldReduceMotion ? 1 : 0.975;

  if (variant === 'secondary') {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: hoverScale, translateY: -1 }}
        whileTap={disabled ? {} : { scale: tapScale }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className={`relative inline-flex items-center justify-center px-6 py-3 text-sm font-black uppercase tracking-wider rounded-full border-2 border-eco-primary text-eco-primary bg-transparent transition-colors duration-200 hover:bg-eco-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: hoverScale, translateY: -2 }}
      whileTap={disabled ? {} : { scale: tapScale }}
      transition={{ type: 'spring', stiffness: 450, damping: 15 }}
      style={{
        boxShadow: disabled ? 'none' : `0 8px 20px -6px ${glowColor}`,
      }}
      className={`relative group inline-flex items-center justify-center p-[2px] overflow-hidden rounded-full font-black uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-eco-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {/* Moving Border Gradient: Only animate if motion is not reduced and button is not disabled */}
      {!disabled && !shouldReduceMotion ? (
        <motion.div
          className="absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#0066FF_0%,#9FCE1A_35%,#FFF3DD_50%,#9FCE1A_75%,#0066FF_100%)]"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-eco-primary to-eco-accentGreen" />
      )}

      {/* Inner Button Content */}
      <span className="relative z-10 w-full h-full flex items-center justify-center px-6 py-3 text-sm rounded-full text-white bg-eco-ink transition-colors duration-200 group-hover:bg-eco-ink/90 group-disabled:bg-eco-ink/50">
        {children}
      </span>
    </motion.button>
  );
}

