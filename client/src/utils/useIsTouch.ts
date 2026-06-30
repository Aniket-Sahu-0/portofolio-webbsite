import { useState } from 'react';

// Phones/tablets get the static, normal-scroll versions of the home scroll
// sections; pointer devices keep the scrub + wheel-hijack card deck. Touch is
// the right axis to split on (not viewport width) because the desktop deck
// depends on wheel hijacking, which is itself gated behind this same check —
// a touch laptop with a wide window must NOT get the deck with no input driver.
export const detectTouch = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// Resolved once on mount. Touch capability doesn't change within a session, and
// keeping it stable avoids a layout swap mid-scroll.
export const useIsTouch = () => useState(detectTouch)[0];
