'use client';

import { useCallback, useRef } from 'react';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export type SwipeStart<T> = {
  data: T;
  clientX: number;
  clientY: number;
  pointerId: number;
};

export type SwipeOptions<T> = {
  /** ratio of cell size to commit a swap. default 0.32 */
  thresholdRatio?: number;
  /** absolute fallback if cell size unavailable. default 24 */
  thresholdPx?: number;
  /** dynamic cell size getter (e.g. board element width / cols) */
  getCellSize?: () => number;
  /** called when a swipe is committed */
  onSwipe: (start: T, dir: SwipeDirection) => void;
  /** called when pointer up without committing (tap fallback) */
  onTap?: (start: T) => void;
};

/**
 * useSwipeGesture
 *  - returns onPointerDown(data) and shared onPointerMove / onPointerUp handlers
 *  - tracks only one active pointer at a time
 *  - guarantees onSwipe fires at most once per gesture
 */
export function useSwipeGesture<T>(options: SwipeOptions<T>) {
  const startRef = useRef<SwipeStart<T> | null>(null);
  const committedRef = useRef(false);

  const beginAt = useCallback((data: T) => (e: React.PointerEvent) => {
    startRef.current = { data, clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId };
    committedRef.current = false;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const s = startRef.current;
    if (!s || committedRef.current) return;
    if (e.pointerId !== s.pointerId) return;
    const dx = e.clientX - s.clientX;
    const dy = e.clientY - s.clientY;
    const threshold = options.getCellSize
      ? options.getCellSize() * (options.thresholdRatio ?? 0.32)
      : options.thresholdPx ?? 24;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    let dir: SwipeDirection;
    if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left';
    else dir = dy > 0 ? 'down' : 'up';
    committedRef.current = true;
    options.onSwipe(s.data, dir);
  }, [options]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const s = startRef.current;
    if (s && !committedRef.current && options.onTap) {
      if (e.pointerId === s.pointerId) options.onTap(s.data);
    }
    startRef.current = null;
    committedRef.current = false;
  }, [options]);

  const onPointerCancel = useCallback(() => {
    startRef.current = null;
    committedRef.current = false;
  }, []);

  return { beginAt, onPointerMove, onPointerUp, onPointerCancel };
}
