function isPartiallyVisible(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom > 0 && rect.top < viewportHeight;
}

function getScrollParents(root: HTMLElement): Array<HTMLElement | Window> {
  const parents = new Set<HTMLElement | Window>();
  parents.add(window);

  let node: HTMLElement | null = root;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      parents.add(node);
    }
    node = node.parentElement;
  }

  return [...parents];
}

/** Révèle les éléments `.reveal` au scroll (pattern iziportfolio). */
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

  const scan = () => {
    root.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => {
      if (isPartiallyVisible(node as HTMLElement)) {
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

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          markVisible(entry.target);
        }
      }
    },
    { threshold: 0.01, rootMargin: '80px 0px 80px 0px' },
  );

  nodes.forEach((node) => {
    observer!.observe(node);
    if (isPartiallyVisible(node as HTMLElement)) {
      markVisible(node);
    }
  });

  const scrollParents = getScrollParents(root);
  scrollParents.forEach((parent) => {
    parent.addEventListener('scroll', scheduleScan, { passive: true });
  });

  scheduleScan();
  requestAnimationFrame(scheduleScan);

  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    observer?.disconnect();
    scrollParents.forEach((parent) => {
      parent.removeEventListener('scroll', scheduleScan);
    });
  };
}
