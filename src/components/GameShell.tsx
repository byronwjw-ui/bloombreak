'use client';

import type { ReactNode } from 'react';
import { THEMES } from '@/design/tokens';

type Props = {
  theme: 'match' | 'tray' | 'bloom';
  topLeft?: ReactNode;
  topRight?: ReactNode;
  children: ReactNode;
};

export default function GameShell({ theme, topLeft, topRight, children }: Props) {
  const t = THEMES[theme];
  return (
    <main className={`min-h-screen w-full ${t.pageBg} ${t.texture}`}>
      <div className="mx-auto w-full max-w-md flex flex-col gap-3 px-3 py-3 sm:py-5">
        <div className="flex items-center justify-between text-xs text-[#9C9CB0]">
          <div>{topLeft}</div>
          <div>{topRight}</div>
        </div>
        {children}
      </div>
    </main>
  );
}
