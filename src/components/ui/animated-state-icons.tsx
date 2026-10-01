'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface StateIconProps {
  size?: number;
  color?: string;
  className?: string;
  duration?: number;
  active?: boolean; // Controlled state if provided
}

function useToggleState(active?: boolean, interval: number = 2200) {
  const [internalOn, setInternalOn] = useState(false);

  useEffect(() => {
    if (active !== undefined) return;
    const id = setInterval(() => setInternalOn((v) => !v), interval);
    return () => clearInterval(id);
  }, [active, interval]);

  return active !== undefined ? active : internalOn;
}

/* ─── 1. LOADING → SUCCESS ─── spinner morphs into checkmark */
export function SuccessIcon({ size = 24, color = 'currentColor', className, duration = 2200, active }: StateIconProps) {
  const done = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <motion.circle
        cx="20"
        cy="20"
        r="16"
        stroke={color}
        strokeWidth={2}
        animate={done ? { pathLength: 1, opacity: 1 } : { pathLength: 0.7, opacity: 0.4 }}
        transition={{ duration: 0.5 }}
      />
      {!done && (
        <motion.circle
          cx="20"
          cy="20"
          r="16"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="25 75"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '20px 20px' }}
        />
      )}
      <motion.path
        d="M12 20l6 6 10-12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={done ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.4, delay: done ? 0.2 : 0 }}
      />
    </svg>
  );
}

/* ─── 2. MENU → CLOSE ─── hamburger morphs to X */
export function MenuCloseIcon({ size = 24, color = 'currentColor', className, duration = 2000, active }: StateIconProps) {
  const open = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <motion.line
        x1="10"
        x2="30"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={open ? { y1: 20, y2: 20, rotate: 45 } : { y1: 12, y2: 12, rotate: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        style={{ transformOrigin: '20px 20px' }}
      />
      <motion.line
        x1="10"
        y1="20"
        x2="30"
        y2="20"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        style={{ transformOrigin: '20px 20px' }}
      />
      <motion.line
        x1="10"
        x2="30"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={open ? { y1: 20, y2: 20, rotate: -45 } : { y1: 28, y2: 28, rotate: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        style={{ transformOrigin: '20px 20px' }}
      />
    </svg>
  );
}

/* ─── 3. PLAY → PAUSE ─── Clock in / Attendance timer */
export function PlayPauseIcon({ size = 24, color = 'currentColor', className, duration = 2400, active }: StateIconProps) {
  const playing = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.g
            key="pause"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: '20px 20px' }}
          >
            <rect x="12" y="10" width="5" height="20" rx="1.5" fill={color} />
            <rect x="23" y="10" width="5" height="20" rx="1.5" fill={color} />
          </motion.g>
        ) : (
          <motion.g
            key="play"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: '20px 20px' }}
          >
            <polygon points="14,10 30,20 14,30" fill={color} />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── 4. LOCK → UNLOCK ─── permissions and shifts */
export function LockUnlockIcon({ size = 24, color = 'currentColor', className, duration = 2600, active }: StateIconProps) {
  const unlocked = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <rect x="9" y="18" width="22" height="16" rx="3" stroke={color} strokeWidth={2} />
      <motion.path
        d="M14 18V13a6 6 0 0112 0v5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        animate={unlocked ? { d: 'M14 18V13a6 6 0 0112 0v2' } : { d: 'M14 18V13a6 6 0 0112 0v5' }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      />
      <motion.circle
        cx="20"
        cy="26"
        r="2"
        fill={color}
        animate={unlocked ? { scale: 0.6, opacity: 0.4 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  );
}

/* ─── 5. COPY → COPIED ─── clipboard with checkmark flash */
export function CopiedIcon({ size = 24, color = 'currentColor', className, duration = 2200, active }: StateIconProps) {
  const copied = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <rect x="12" y="10" width="18" height="22" rx="2" stroke={color} strokeWidth={2} />
      <path d="M10 14h-0a2 2 0 00-2 2v18a2 2 0 002 2h14" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.3} />
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.path
            key="check"
            d="M16 21l4 4 6-8"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <motion.g
            key="lines"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <line x1="17" y1="18" x2="25" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
            <line x1="17" y1="23" x2="25" y2="23" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
            <line x1="17" y1="28" x2="22" y2="28" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── 6. BELL → NOTIFICATION ─── bell rings then dot appears */
export function NotificationIcon({ size = 24, color = 'currentColor', className, duration = 2800, active }: StateIconProps) {
  const notif = useToggleState(active, duration);
  return (
    <motion.svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn('shrink-0', className)}
      animate={notif ? { rotate: [0, 8, -8, 6, -6, 3, 0] } : { rotate: 0 }}
      transition={{ duration: 0.6 }}
      style={{ width: size, height: size, transformOrigin: '20px 6px' }}
    >
      <path d="M28 16a8 8 0 00-16 0c0 8-4 10-4 10h24s-4-2-4-10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 30a3 3 0 005 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <motion.circle
        cx="28"
        cy="10"
        r="4"
        fill="#EF4444"
        animate={notif ? { scale: [0, 1.3, 1], opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      />
    </motion.svg>
  );
}

/* ─── 7. DOWNLOAD → DONE ─── arrow drops into tray then checks */
export function DownloadDoneIcon({ size = 24, color = 'currentColor', className, duration = 2400, active }: StateIconProps) {
  const done = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <path d="M8 28v4a2 2 0 002 2h20a2 2 0 002-2v-4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <AnimatePresence mode="wait">
        {done ? (
          <motion.path
            key="check"
            d="M14 22l6 6 8-10"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        ) : (
          <motion.g
            key="arrow"
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <line x1="20" y1="6" x2="20" y2="24" stroke={color} strokeWidth={2} strokeLinecap="round" />
            <polyline points="14,18 20,24 26,18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

/* ─── 8. SEND ─── paper plane flies off then resets */
export function SendIcon({ size = 24, color = 'currentColor', className, duration = 2600, active }: StateIconProps) {
  const sent = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <motion.g
        animate={sent ? { x: 30, y: -30, opacity: 0, scale: 0.5 } : { x: 0, y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        <path d="M34 6L16 20l-6-2L34 6z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        <path d="M34 6L22 34l-6-14" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        <line x1="16" y1="20" x2="22" y2="34" stroke={color} strokeWidth={2} />
      </motion.g>
    </svg>
  );
}

/* ─── 9. TOGGLE ─── switch flips with spring */
export function ToggleIcon({ size = 24, color = 'currentColor', className, duration = 1800, active }: StateIconProps) {
  const on = useToggleState(active, duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <motion.rect
        x="5"
        y="13"
        width="30"
        height="14"
        rx="7"
        animate={on ? { fill: color, opacity: 0.25 } : { fill: color, opacity: 0.08 }}
        transition={{ duration: 0.3 }}
      />
      <rect x="5" y="13" width="30" height="14" rx="7" stroke={color} strokeWidth={2} opacity={on ? 1 : 0.4} />
      <motion.circle
        cy="20"
        r="5"
        fill={color}
        animate={on ? { cx: 28 } : { cx: 12 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      />
    </svg>
  );
}

/* ─── 10. SPARKLE / AI ─── pulsing star with rotating sparkles */
export function SparkleAiIcon({ size = 24, color = 'currentColor', className }: StateIconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn('shrink-0', className)} style={{ width: size, height: size }}>
      <motion.path
        d="M20 4L23 15L34 18L23 21L20 32L17 21L6 18L17 15L20 4Z"
        fill={color}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '20px 18px' }}
      />
      <motion.circle
        cx="32"
        cy="8"
        r="2"
        fill="#FBBF24"
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="8"
        cy="28"
        r="1.5"
        fill="#60A5FA"
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}
      />
    </svg>
  );
}
