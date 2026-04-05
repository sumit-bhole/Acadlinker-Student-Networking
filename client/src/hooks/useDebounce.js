import { useState, useEffect } from "react";

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer to update the value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If the value changes BEFORE the timer finishes, clear the timer
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};