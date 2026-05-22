'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Position, Tile as TileT } from '@/types/game';
import Tile from './Tile';
import { isAdjacent } from '@/lib/gameLogic';

type Props = {
  board: TileT[][];
  explodingKeys: Set<string>;
  disabled?: boolean;
  onSwap: (a: Position, b: Position) => void;
};

export default function GameBoard({ board, explodingKeys, disabled, onSwap }: Props) {
  const [selected, setSelected] = useState<Position | null>(null);

  // clear selection if board got externally reset
  useEffect(() => {
    if (disabled) setSelected(null);
  }, [disabled]);

  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  const handleClick = (pos: Position) => {
    if (disabled) return;
    if (!selected) {
      setSelected(pos);
      return;
    }
    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null);
      return;
    }
    if (isAdjacent(selected, pos)) {
      onSwap(selected, pos);
      setSelected(null);
    } else {
      // re-anchor selection
      setSelected(pos);
    }
  };

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      width: 'min(92vw, 420px)',
    }),
    [cols]
  );

  return (
    <div
      className="rounded-3xl p-2 sm:p-3 bg-white/60 backdrop-blur shadow-soft"
      style={{ width: 'min(94vw, 432px)' }}
    >
      <div className="grid gap-1 sm:gap-1.5" style={gridStyle}>
        {board.map((row, r) =>
          row.map((tile, c) => {
            const key = `${r}_${c}`;
            const isSelected =
              !!selected && selected.row === r && selected.col === c;
            const exploding = explodingKeys.has(key);
            // tile may be null between removal & refill - guard
            if (!tile) {
              return (
                <div
                  key={key}
                  className="aspect-square rounded-xl bg-transparent"
                />
              );
            }
            return (
              <Tile
                key={tile.id}
                tile={tile}
                selected={isSelected}
                exploding={exploding}
                onClick={() => handleClick({ row: r, col: c })}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
