import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to page hero (if present) or to top on every route change.
 * Convention: add one of these to your hero section wrapper:
 *  - id="page-hero"
 *  - data-hero
 *  - className includes "page-hero"
 */
export default function ScrollOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    // Try to find an explicit hero target
    const hero = (document.querySelector('#page-hero, [data-hero], .page-hero') as HTMLElement) || null;

    if (hero) {
      // Use instant jump to avoid seeing intermediate positions
      hero.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    // Also reset focus for accessibility
    const main = document.querySelector('main') as HTMLElement | null;
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      main.removeAttribute('tabindex');
    }
  }, [location.pathname]);

  return null;
}
