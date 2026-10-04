// Funnel drop-off tracking. Each visitor gets a session id; every step they
// reach (page view, video milestones, sections scrolled into view, CTA
// clicks) is sent to the kenjiai.com funnel-track function, which keeps one
// record per session. kenjiai.com/funnel-stats/ shows where people leave.
// sendBeacon with a plain string goes out as text/plain, so there's no CORS
// preflight and the event still sends if the visitor is leaving the page.

const ENDPOINT = 'https://kenjiai.com/.netlify/functions/funnel-track';
const FUNNEL = 'lowticket';
const SID_KEY = 'kenji_funnel_sid';

function sessionId(): string {
  try {
    const saved = sessionStorage.getItem(SID_KEY);
    if (saved) return saved;
    const sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SID_KEY, sid);
    return sid;
  } catch {
    return 'nostore-' + Math.random().toString(36).slice(2);
  }
}

const SID = typeof window === 'undefined' ? '' : sessionId();
const sent = new Set<string>();

/** Send a funnel step once per page load. `step` must be on the server's allowlist. */
export function trackStep(step: string, extra: Record<string, string | number> = {}) {
  if (!SID || sent.has(step)) return;
  sent.add(step);
  const params = new URLSearchParams(window.location.search);
  const body = JSON.stringify({
    funnel: FUNNEL,
    sid: SID,
    step,
    ...extra,
    utm_source: params.get('utm_source') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    page: window.location.pathname.slice(0, 60),
    version: __PAGE_VERSION__,
    device: window.innerWidth < 768 ? 'mobile' : 'desktop',
  });
  try {
    if (navigator.sendBeacon?.(ENDPOINT, body)) return;
  } catch {
    /* fall through to fetch */
  }
  fetch(ENDPOINT, { method: 'POST', body, keepalive: true, mode: 'no-cors' }).catch(() => {});
}

/** Fire `section_<name>` when any element with data-track-section="<name>" is half visible. */
export function observeSections() {
  const els = document.querySelectorAll<HTMLElement>('[data-track-section]');
  if (!('IntersectionObserver' in window)) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        trackStep('section_' + (e.target as HTMLElement).dataset.trackSection);
        io.unobserve(e.target);
      }
    },
    { threshold: 0.4 },
  );
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

/** Track time on page in buckets (10s, 30s, 60s, 120s, 300s) while the tab is visible. */
export function trackTimeOnPage() {
  const buckets = [10, 30, 60, 120, 300];
  let seconds = 0;
  const timer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    seconds += 1;
    if (buckets.includes(seconds)) trackStep('time_' + seconds + 's');
    if (seconds >= 300) clearInterval(timer);
  }, 1000);
  return () => clearInterval(timer);
}

/** Video play + 25/50/75/95/100% milestones. */
export function trackVideo(video: HTMLVideoElement) {
  const onPlay = () => trackStep('video_play');
  const onTime = () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    for (const m of [25, 50, 75, 95]) if (pct >= m) trackStep('video_' + m);
  };
  const onEnded = () => trackStep('video_100');
  video.addEventListener('play', onPlay);
  video.addEventListener('timeupdate', onTime);
  video.addEventListener('ended', onEnded);
  return () => {
    video.removeEventListener('play', onPlay);
    video.removeEventListener('timeupdate', onTime);
    video.removeEventListener('ended', onEnded);
  };
}

/** Scroll depth: scroll_25 / 50 / 75 / 100 (% of the page height reached). */
export function trackScrollDepth() {
  const marks = [25, 50, 75, 100];
  const onScroll = () => {
    const doc = document.documentElement;
    const seen = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
    for (const m of marks) if (seen >= m - 1) trackStep('scroll_' + m);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}
