// v1 levels stub - replaced by trayLevels2.ts
import type { TrayLevel } from '@/types/game';
export const TRAY_LEVELS: TrayLevel[] = [];
export const TRAY_MAX_LEVEL = 0;
export function getTrayLevel(_id: number): TrayLevel {
  throw new Error('v1 trayLevels deprecated');
}
