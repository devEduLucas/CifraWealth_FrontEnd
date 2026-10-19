import { useState } from 'react';

const STORAGE_KEY = 'cifrawealth:sidebar-collapsed';

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* Keep the choice for this page. */ }
  }

  return { collapsed, toggle };
}
