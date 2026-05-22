import type { TrayCard, TrayCardType } from '@/types/game';
import { shuffle } from './random';

export const TRAY_SIZE_DEFAULT = 7;

export type TrayHistoryEntry = {
  cardId: string;
  prevTray: TrayCard[];
  clearedType: TrayCardType | null;
};

export type TrayState = {
  remainingCards: TrayCard[];
  tray: TrayCard[];
  removedIds: Set<string>;
  history: TrayHistoryEntry[];
};

export function initState(cards: TrayCard[]): TrayState {
  return {
    remainingCards: cards.slice(),
    tray: [],
    removedIds: new Set(),
    history: [],
  };
}

export function isCardClickable(card: TrayCard, state: TrayState): boolean {
  if (state.removedIds.has(card.id)) return false;
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

export function pickCard(state: TrayState, cardId: string, traySize: number): PickResult {
  const card = state.remainingCards.find((c) => c.id === cardId);
  if (!card) return { state, clearedGroup: null, isTrayFull: false, isWon: false };
  if (!isCardClickable(card, state)) return { state, clearedGroup: null, isTrayFull: false, isWon: false };

  const removedIds = new Set(state.removedIds);
  removedIds.add(card.id);

  const prevTray = state.tray.slice();
  let tray = [...state.tray, card];
  let clearedGroup: TrayCardType | null = null;

  const counts: Partial<Record<TrayCardType, number>> = {};
  for (const t of tray) counts[t.type] = (counts[t.type] ?? 0) + 1;
  const triple = (Object.entries(counts) as [TrayCardType, number][]).find(([, n]) => n >= 3);
  if (triple) {
    const [type] = triple;
    clearedGroup = type;
    let removed = 0;
    const next: TrayCard[] = [];
    for (let i = 0; i < tray.length; i++) {
      if (removed < 3 && tray[i].type === type) removed += 1;
      else next.push(tray[i]);
    }
    tray = next;
  }

  const remainingCards = state.remainingCards.filter((c) => !removedIds.has(c.id));
  const newState: TrayState = {
    remainingCards,
    tray,
    removedIds,
    history: [...state.history, { cardId: card.id, prevTray, clearedType: clearedGroup }],
  };

  return {
    state: newState,
    clearedGroup,
    isTrayFull: tray.length >= traySize,
    isWon: remainingCards.length === 0 && tray.length === 0,
  };
}

export function undo(state: TrayState): TrayState {
  if (state.history.length === 0) return state;
  const last = state.history[state.history.length - 1];
  const removedIds = new Set(state.removedIds);
  removedIds.delete(last.cardId);
  // try find card in any source: it must have been in remainingCards before move
  // we restore via prevTray + putting card back to remainingCards
  // Since the card was clickable when picked, putting it back to remainingCards at front is safe.
  const restoredCard = findCardEverywhere(state, last.cardId);
  if (!restoredCard) return state;
  const remainingCards = [restoredCard, ...state.remainingCards];
  return {
    remainingCards,
    tray: last.prevTray,
    removedIds,
    history: state.history.slice(0, -1),
  };
}

function findCardEverywhere(state: TrayState, id: string): TrayCard | null {
  for (const c of state.tray) if (c.id === id) return c;
  for (const c of state.remainingCards) if (c.id === id) return c;
  for (const e of state.history) {
    for (const c of e.prevTray) if (c.id === id) return c;
  }
  return null;
}

/** Shuffle the TYPES of currently-clickable remaining cards, keeping blockedBy structure intact. */
export function safeShuffle(state: TrayState): TrayState {
  const clickable = state.remainingCards.filter((c) => isCardClickable(c, state));
  if (clickable.length < 2) return state;
  const types = clickable.map((c) => c.type);
  const shuffled = shuffle(types);
  const map = new Map<string, TrayCardType>();
  clickable.forEach((c, i) => map.set(c.id, shuffled[i]));
  const remainingCards = state.remainingCards.map((c) => (map.has(c.id) ? { ...c, type: map.get(c.id)! } : c));
  return { ...state, remainingCards };
}

/** Find a "safe" hint: a clickable card whose type either has 2 already in tray (will clear) or has fewest in tray. */
export function findHint(state: TrayState): string | null {
  const clickable = state.remainingCards.filter((c) => isCardClickable(c, state));
  if (clickable.length === 0) return null;
  const trayCounts: Partial<Record<TrayCardType, number>> = {};
  for (const t of state.tray) trayCounts[t.type] = (trayCounts[t.type] ?? 0) + 1;
  // priority 1: complete a triple
  const completes = clickable.find((c) => (trayCounts[c.type] ?? 0) >= 2);
  if (completes) return completes.id;
  // priority 2: pick the type with the most remaining (lower risk overall)
  const remainCounts: Partial<Record<TrayCardType, number>> = {};
  for (const c of state.remainingCards) remainCounts[c.type] = (remainCounts[c.type] ?? 0) + 1;
  clickable.sort((a, b) => (remainCounts[b.type] ?? 0) - (remainCounts[a.type] ?? 0));
  return clickable[0].id;
}

export function isTrayDeadlocked(state: TrayState, traySize: number): boolean {
  if (state.tray.length < traySize) return false;
  const counts: Partial<Record<TrayCardType, number>> = {};
  for (const t of state.tray) counts[t.type] = (counts[t.type] ?? 0) + 1;
  return !Object.values(counts).some((n) => (n ?? 0) >= 3);
}
