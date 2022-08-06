import type { RefObject } from "react";
import { useEffect } from "react";

// Reference : https://usehooks.com/useOnClickOutside/
const MOUSEDOWN = "mousedown";
const TOUCHSTART = "touchstart";
type HandledEvents = [typeof MOUSEDOWN, typeof TOUCHSTART];
type HandledEventsType = HandledEvents[number];
type PossibleEvent = {
  [Type in HandledEventsType]: HTMLElementEventMap[Type];
}[HandledEventsType];
type Handler = (event: PossibleEvent) => void;

// const events: HandledEvents = [MOUSEDOWN, TOUCHSTART];

export function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: Handler | undefined
) {
  useEffect(
    () => {
      const listener = (event: PossibleEvent) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target as Node)) {
          return;
        }
        handler?.(event);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}
