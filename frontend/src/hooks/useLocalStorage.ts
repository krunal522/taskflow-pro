// ============================================
// HOOKS — useLocalStorage
// ============================================

import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('useLocalStorage set error:', e);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      localStorage.removeItem(key);
    } catch (e) {
      console.error('useLocalStorage remove error:', e);
    }
  };

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
