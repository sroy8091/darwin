import { useState, useCallback } from 'react';

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * A custom hook for managing state with undo/redo functionality.
 * @param initialPresent The initial state.
 */
export const useHistory = <T>(initialPresent: T) => {
  const [state, setState] = useState<History<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  /**
   * Set a new state. This will add the current state to the past and clear the future (redo stack).
   * It accepts a new state value or a function that receives the previous state.
   */
  const set = useCallback((newPresent: React.SetStateAction<T>) => {
    setState(s => {
      const resolvedNewPresent = typeof newPresent === 'function'
        ? (newPresent as (prevState: T) => T)(s.present)
        : newPresent;

      // Do not update history if the state is unchanged.
      if (JSON.stringify(resolvedNewPresent) === JSON.stringify(s.present)) {
        return s;
      }

      return {
        past: [...s.past, s.present],
        present: resolvedNewPresent,
        future: [],
      };
    });
  }, []);

  /**
   * Go back to the previous state in the history.
   */
  const undo = useCallback(() => {
    setState(s => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      const newPast = s.past.slice(0, s.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [s.present, ...s.future],
      };
    });
  }, []);

  /**
   * Go forward to the next state in the history.
   */
  const redo = useCallback(() => {
    setState(s => {
      if (s.future.length === 0) return s;
      const next = s.future[0];
      const newFuture = s.future.slice(1);
      return {
        past: [...s.past, s.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);
  
  /**
   * Reset the history with a new initial state.
   */
  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  return {
    state: state.present,
    set,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
