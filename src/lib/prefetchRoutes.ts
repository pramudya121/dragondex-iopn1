// Route prefetcher: warm up the dynamic chunks of lazy-loaded pages on
// hover/focus so navigation feels instant. Each entry mirrors the lazy()
// import in App.tsx — keep them in sync.

type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  '/': () => import('@/pages/Index'),
  '/swap': () => import('@/pages/Swap'),
  '/liquidity': () => import('@/pages/Liquidity'),
  '/pools': () => import('@/pages/Pools'),
  '/create-pool': () => import('@/pages/CreatePool'),
  '/analytics': () => import('@/pages/Analytics'),
  '/portfolio': () => import('@/pages/Portfolio'),
  '/docs': () => import('@/pages/Docs'),
  '/farming': () => import('@/pages/Farming'),
  '/admin/farming': () => import('@/pages/AdminFarming'),
};

const warmed = new Set<string>();

export function prefetchRoute(path: string) {
  if (warmed.has(path)) return;
  const loader = loaders[path];
  if (!loader) return;
  warmed.add(path);
  // fire-and-forget; ignore failures (will retry on real navigation)
  loader().catch(() => warmed.delete(path));
}

// Idle-warm the top routes after the app boots so the first hover is instant.
export function warmCriticalRoutes() {
  const idle = (cb: () => void) =>
    (typeof window !== 'undefined' && 'requestIdleCallback' in window)
      ? (window as any).requestIdleCallback(cb, { timeout: 2000 })
      : setTimeout(cb, 1200);
  idle(() => {
    ['/swap', '/liquidity', '/pools', '/analytics', '/portfolio'].forEach(prefetchRoute);
  });
}
