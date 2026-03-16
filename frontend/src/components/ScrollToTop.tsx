import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Scroll to top only on PUSH (link clicks) or REPLACE (redirects)
    // Avoid scrolling on POP (back button) to preserve native browser scroll restoration
    if (navType !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Instant is better for page transitions to avoid flickering
      });
    }
  }, [pathname, navType]);

  return null;
}
