function findScrollRoot(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function isPartiallyVisible(el: HTMLElement, scrollRoot: HTMLElement | null): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  if (!scrollRoot) {
    return rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;
  }

  const rootRect = scrollRoot.getBoundingClientRect();
  return (
    rect.bottom > rootRect.top &&
    rect.top < rootRect.bottom &&
    rect.right > rootRect.left &&
    rect.left < rootRect.right
  );
}

function getScrollTargets(root: HTMLElement): Array<HTMLElement | Window> {
  const targets = new Set<HTMLElement | Window>();
  targets.add(window);

  const scrollRoot = findScrollRoot(root);
  if (scrollRoot) {
    targets.add(scrollRoot);
  }

  return [...targets];
}

/** Révèle les éléments `.reveal` au scroll (conteneur landing ou fenêtre). */
export function initRevealOnScroll(root: HTMLElement): () => void {
  const revealed = new WeakSet<Element>();
  let observer: IntersectionObserver | undefined;
  let rafId = 0;

  const markVisible = (el: Element) => {
    if (revealed.has(el)) return;
    revealed.add(el);
    el.classList.add('is-visible');
    observer?.unobserve(el);
  };

  const scrollRoot = findScrollRoot(root) ?? root.closest('app-landing');

  const scan = () => {
    root.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => {
      if (isPartiallyVisible(node as HTMLElement, scrollRoot)) {
        markVisible(node);
      }
    });
  };

  const scheduleScan = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      scan();
    });
  };

  const nodes = root.querySelectorAll('.reveal');
  if (!nodes.length) {
    return () => undefined;
  }

  if (typeof IntersectionObserver === 'undefined') {
    nodes.forEach((node) => markVisible(node));
    return () => undefined;
  }

  // Observer viewport : fiable quand le scroll est dans app-landing (pas window).
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          markVisible(entry.target);
        }
      }
    },
    {
      root: null,
      threshold: [0, 0.05, 0.12],
      rootMargin: '0px 0px -4% 0px',
    },
  );

  nodes.forEach((node) => {
    observer!.observe(node);
    if (isPartiallyVisible(node as HTMLElement, scrollRoot)) {
      markVisible(node);
    }
  });

  const observeNewNodes = () => {
    root.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => {
      if (!revealed.has(node)) {
        observer!.observe(node);
        if (isPartiallyVisible(node as HTMLElement, scrollRoot)) {
          markVisible(node);
        }
      }
    });
  };

  let mutationObserver: MutationObserver | undefined;
  if (typeof MutationObserver !== 'undefined') {
    mutationObserver = new MutationObserver(() => {
      observeNewNodes();
      scheduleScan();
    });
    mutationObserver.observe(root, { childList: true, subtree: true });
  }

  const scrollTargets = getScrollTargets(root);
  scrollTargets.forEach((target) => {
    target.addEventListener('scroll', scheduleScan, { passive: true });
  });
  window.addEventListener('resize', scheduleScan, { passive: true });

  scheduleScan();
  requestAnimationFrame(scheduleScan);
  setTimeout(scheduleScan, 120);
  setTimeout(scheduleScan, 400);

  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    observer?.disconnect();
    mutationObserver?.disconnect();
    scrollTargets.forEach((target) => {
      target.removeEventListener('scroll', scheduleScan);
    });
    window.removeEventListener('resize', scheduleScan);
  };
}
