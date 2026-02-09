import { useEffect } from 'react';

/**
 * useOutsideClick - Calls the callback when a click occurs outside the given ref.
 *
 * @param ref - React ref of the element to detect outside clicks for
 * @param callback - Function to call when an outside click is detected
 */
export const useOutsideClick = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};
