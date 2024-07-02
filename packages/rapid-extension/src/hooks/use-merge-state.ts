import { useState } from "react";

export function useMergeState<S>(initState: S): [S, (arg: Partial<S> | ((s: S) => S)) => void] {
  const [state, setState] = useState<S>(initState);

  const setMergeState = (arg: Partial<S> | ((s: S) => S)) => {
    if (typeof arg === "function") {
      setState(arg);
      return;
    }

    setState((draft) => {
      return { ...draft, ...arg };
    });
  };

  return [state, setMergeState];
}
