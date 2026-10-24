import { useSyncExternalStore } from 'react';
import { session } from '../lib/session';

export function useSessionUser() {
  return useSyncExternalStore(session.subscribe, session.getUser);
}
