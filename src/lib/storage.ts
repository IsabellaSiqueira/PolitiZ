/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

const NAMESPACE = 'politiz_progress_v1';

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(`${NAMESPACE}:${key}`);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(`${NAMESPACE}:${key}`, JSON.stringify(state));
    } catch {
      // localStorage indisponível (modo privado, quota cheia etc) — progresso só não persiste nessa sessão
    }
  }, [key, state]);

  return [state, setState];
}
