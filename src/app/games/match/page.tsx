'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MatchPlaceholder() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return <div className="p-8 text-center text-[#9C9CB0]">跳转中…</div>;
}
