import type { TrayCard, TrayCardType } from '@/types/game';

export const TRAY_SIZE = 7;

export type TrayState = {
  remainingCards: TrayCard[]; // not yet picked
  tray: TrayCard[]; // currently in tray
  removedIds: Set<string>;
};

export function isCardClickable(card: TrayCard, state: TrayState): boolean {
  if (state.removedIds.has(card.id)) return false;
  // a card is clickable when every blocker is already removed
  for (const blockerId of card.blockedBy) {
    if (!state.removedIds.has(blockerId)) return false;
  }
  return true;
}

export type PickResult = {
  state: TrayState;
  clearedGroup: TrayCardType | null;
  isTrayFull: boolean;
  isWon: boolean;
};

export function pickCard(state: TrayState, cardId: string): PickResult {
  const card = state.remainingCards.find((c) => c.id === cardId);
  if (!card) {
    return { state, clearedGroup: null, isTrayFull: false, isWon: false };
  }
  if (!isCardClickable(card, state)) {
    return { state, clearedGroup: null, isTrayFull: false, isWon: false };
  }

  const removedIds = new Set(state.removedIds);
  removedIds.add(card.id);

  let tray = [...state.tray, card];
  let clearedGroup: TrayCardType | null = null;

  // check for three same
  const counts: Partial<Record<TrayCardType, number>> = {};
  for (const t of tray) counts[t.type] = (counts[t.type] ?? 0) + 1;
  const triple = (Object.entries(counts) as [TrayCardType, number][]).find(([, n]) => n >= 3);
  if (triple) {
    const [type] = triple;
    clearedGroup = type;
    let removed = 0;
    const next: TrayCard[] = [];
    for (let i = 0; i < tray.length; i++) {
      if (removed < 3 && tray[i].type === type) {
        removed += 1;
      } else {
        next.push(tray[i]);
      }
    }
    tray = next;
  }

  const remainingCards = state.remainingCards.filter((c) => !removedIds.has(c.id));
  const newState: TrayState = { remainingCards, tray, removedIds };

  const isTrayFull = tray.length >= TRAY_SIZE;
  const isWon = remainingCards.length === 0 && tray.length === 0;
  return { state: newState, clearedGroup, isTrayFull, isWon };
}

export function initState(cards: TrayCard[]): TrayState {
  return {
    remainingCards: cards.slice(),
    tray: [],
    removedIds: new Set(),
  };
}

/** can the tray still resolve? (any clearable group reachable) */
export function isTrayDeadlocked(state: TrayState): boolean {
  if (state.tray.length < TRAY_SIZE) return false;
  // tray full and no triple in tray - dead
  const counts: Partial<Record<TrayCardType, number>> = {};
  for (const t of state.tray) counts[t.type] = (counts[t.type] ?? 0) + 1;
  const hasTriple = Object.values(counts).some((n) => (n ?? 0) >= 3);
  return !hasTriple;
}
