import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Ensure browser doesn't try to restore middle-of-page scroll on navigation
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Immediately scroll window to top
    window.scrollTo(0, 0);

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Also reset scroll on all root / app frame containers
    const containers = document.querySelectorAll(
      '.phone-simulation-container, .app-frame, .page-container, #root'
    );
    containers.forEach((el) => {
      if (el) {
        el.scrollTop = 0;
      }
    });

    // Double check on next frame in case components rendered asynchronously
    const frameId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
