import { useEffect, useRef } from 'react';

export type RefHook<T> = {
  current: T;
};

export const useComparatorRef = <T>(
  value: T | null | undefined,
  isEqual: (v1: T | null | undefined, v2: T | null | undefined) => boolean,
  onChange?: () => void
): RefHook<T | null | undefined> => {
  const ref = useRef(value);
  useEffect(() => {
    if (!isEqual(value, ref.current)) {
      ref.current = value;
      if (onChange) {
        onChange();
      }
    }
  });
  return ref;
};
