'use client';

import { useCallback, useRef, useState } from 'react';
import type { Position } from '@/types/game';

export type ChainGestureOptions = {
  size: number; // board cells per side
  boardRef: React.RefObject<HTMLDivElement>;
  canExtend: (chain: Position[], next: Position) => boolean;
  onRelease: (chain: Position[]) => void;
};

export function useChainGesture(opts: ChainGestureOptions) {
  const [chain, setChain] = useState<Position[]>([]);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);

  const cellFromClient = useCallback((clientX: number, clientY: number): { pos: Position | null; pct: { x: number; y: number } | null } => {
    const el = opts.boardRef.current;
    if (!el) return { pos: null, pct: null };
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return { pos: null, pct: { x: pctX, y: pctY } };
    const col = Math.floor((x / rect.width) * opts.size);
    const row = Math.floor((y / rect.height) * opts.size);
    if (col < 0 || col >= opts.size || row < 0 || row >= opts.size) return { pos: null, pct: { x: pctX, y: pctY } };
    return { pos: { row, col }, pct: { x: pctX, y: pctY } };
  }, [opts.boardRef, opts.size]);

  const tryAdd = useCallback((pos: Position) => {
    setChain((prev) => {
      if (prev.length === 0) {
        if (!opts.canExtend(prev, pos)) return prev;
        return [pos];
      }
      const last = prev[prev.length - 1];
      if (last.row === pos.row && last.col === pos.col) return prev;
      // backtrack
      if (prev.length >= 2) {
        const beforeLast = prev[prev.length - 2];
        if (beforeLast.row === pos.row && beforeLast.col === pos.col) return prev.slice(0, -1);
      }
      if (prev.some((p) => p.row === pos.row && p.col === pos.col)) return prev;
      if (!opts.canExtend(prev, pos)) return prev;
      return [...prev, pos];
    });
  }, [opts]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const { pos, pct } = cellFromClient(e.clientX, e.clientY);
    if (!pos) return;
    setChain([]);
    setTip(pct);
    draggingRef.current = true;
    tryAdd(pos);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }, [cellFromClient, tryAdd]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { pos, pct } = cellFromClient(e.clientX, e.clientY);
    setTip(pct);
    if (pos) tryAdd(pos);
  }, [cellFromClient, tryAdd]);

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const c = chain;
    setChain([]);
    setTip(null);
    opts.onRelease(c);
  }, [chain, opts]);

  const onPointerCancel = useCallback(() => {
    draggingRef.current = false;
    setChain([]);
    setTip(null);
  }, []);

  const cancel = useCallback(() => {
    setChain([]);
    setTip(null);
    draggingRef.current = false;
  }, []);

  return {
    chain,
    tip,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    cancel,
  };
}
