import { customAlphabet } from "nanoid";
import { useMemo } from "react";

export const useNanoId = () => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoId = useMemo(() => customAlphabet(alphabet, 10)(), []);
  return nanoId;
};
