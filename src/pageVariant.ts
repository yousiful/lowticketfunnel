// Page-level split test on the default route: 'control' (App.tsx) vs 'skool'
// (SkoolStyle.tsx, the community "About" page layout). Each new visitor gets
// a 50/50 pick, saved in localStorage so returns see the same page.
// ?v=control or ?v=skool forces a page for QA without touching the saved pick.
// The assignment is reported once per page load to Meta Pixel + the dataLayer,
// and funnelTrack tags every event's version with it so the funnel-stats
// dashboard splits by variant.

import { setPageVariant } from './funnelTrack';

export type PageVariant = 'control' | 'skool';

const STORAGE_KEY = 'kenji_page_variant';
const VARIANTS: PageVariant[] = ['control', 'skool'];

type TrackingWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
};

const isVariant = (v: string | null): v is PageVariant => VARIANTS.includes(v as PageVariant);

export function assignPageVariant(): PageVariant {
  const forced = new URLSearchParams(window.location.search).get('v');
  let variant: PageVariant;
  let assignedBy: 'url' | 'saved' | 'new';

  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage blocked: falls through to a fresh pick */
  }

  if (isVariant(forced)) {
    variant = forced;
    assignedBy = 'url';
  } else if (isVariant(saved)) {
    variant = saved;
    assignedBy = 'saved';
  } else {
    variant = Math.random() < 0.5 ? 'control' : 'skool';
    assignedBy = 'new';
    try {
      localStorage.setItem(STORAGE_KEY, variant);
    } catch {
      /* ignore persistence failure */
    }
  }

  setPageVariant(variant);
  current = variant;
  currentBy = assignedBy;
  const w = window as TrackingWindow;
  w.fbq?.('trackCustom', 'PageVariant', { variant, assigned_by: assignedBy });
  w.dataLayer?.push({ event: 'page_variant_assigned', page_variant: variant, assigned_by: assignedBy });
  return variant;
}

let current: PageVariant | null = null;
let currentBy: 'url' | 'saved' | 'new' | null = null;

// Checkout link tagged with the page version (pv) so GHL saves it on the buyer's
// contact (lastAttributionSource.url) and sales can be split by variant. Ad params
// from the landing URL (utm_*, fbclid) are carried over too. QA visits forced with
// ?v= are tagged pv_qa so they never count as a real variant sale.
export function checkoutUrl(base: string): string {
  const u = new URL(base);
  const here = new URLSearchParams(window.location.search);
  here.forEach((value, key) => {
    if (key.startsWith('utm_') || key === 'fbclid') u.searchParams.set(key, value);
  });
  if (current) u.searchParams.set('pv', currentBy === 'url' ? `${current}_qa` : current);
  return u.toString();
}
