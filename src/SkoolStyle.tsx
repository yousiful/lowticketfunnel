import { checkoutUrl } from './pageVariant';
import { useEffect, useRef, useState } from 'react';
import { Lock, Tag, Check, Play, ChevronDown } from 'lucide-react';
import { trackStep, observeSections, trackTimeOnPage, trackVideo, trackScrollDepth } from './funnelTrack';
import { CHECKOUT_URL_MONTHLY, FAQS } from './App';

/**
 * 'skool' arm of the default-route split test (see pageVariant.ts). Same offer,
 * price, checkout and tracking as the control (App.tsx), laid out like a
 * community "About" page: media viewer with a thumbnail strip, a meta row,
 * a plain description, and a sticky join card on the right.
 *
 * Every image is real: the VSL poster, the Freedom Club bundle graphic, and
 * frames cropped from the walkthrough video showing the actual member area.
 * No member count, online count or star rating is shown because there is no
 * real number behind one. The stats in the join card are the ones the
 * control already stands behind.
 *
 * Checkout values mirror App.tsx PLAN_DETAILS.monthly. If the price changes on
 * the GHL side, update both.
 */
const PLAN = { name: 'Freedom Club - Monthly Membership', contentId: 'ace-monthly', value: 7.0 };

const VSL_SRC = '/videos/freedom-club-vsl.mp4';
const REVIEWS_SCRIPT_SRC = 'https://reputationhub.site/reputation/assets/review-widget.js';
const REVIEWS_IFRAME_SRC = 'https://reputationhub.site/reputation/widgets/review_widget/q5L4ttbBMHNxieXIcTVJ';

type TrackingWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
};

type Media = { id: string; thumb: string; src: string; alt: string; video?: boolean };

const MEDIA: Media[] = [
  { id: 'video', video: true, thumb: '/club/poster-thumb.webp', src: '/club/poster.webp', alt: 'Freedom Club walkthrough video' },
  { id: 'bundle', thumb: '/club/bundle-thumb.webp', src: '/freedom-club-bundle-1200w.webp', alt: 'Everything included in Freedom Club' },
  { id: 'classroom', thumb: '/club/classroom-thumb.webp', src: '/club/classroom.webp', alt: 'The course library inside the member area' },
  { id: 'courses-1', thumb: '/club/courses-1-thumb.webp', src: '/club/courses-1.webp', alt: 'Self-Liquidating Meta Ad Campaigns, AI Tools Overview and Close 4 Survival courses' },
  { id: 'courses-2', thumb: '/club/courses-2-thumb.webp', src: '/club/courses-2.webp', alt: 'Client Attraction Secrets, Paid Ads Certified and the $1 lead method courses' },
  { id: 'calendar', thumb: '/club/calendar-thumb.webp', src: '/club/calendar.webp', alt: 'The events calendar inside the member area' },
];

const TRAININGS = [
  ['Self-Liquidating Meta Ad Campaigns', 'Campaigns built to pay for themselves on the front end.'],
  ['The AI Tools I Use For Paid Ads', 'Realistic ad creative without a camera crew or a designer.'],
  ['How To Close Deals From Paid Ads', 'The real process from first reply to signed client.'],
  ['Client Attraction Secrets', 'Positioning that gets good clients reaching out to you first.'],
  ['Paid Ads Certified Course', 'A structured path through paid traffic, so you stop guessing.'],
  ['The $1 Lead Method', 'Qualified leads for about a dollar each.'],
];

const EXTRAS = [
  'Meta campaign templates you can copy',
  '30 ad hooks swipe file',
  'AI prompt pack for ad copy, targeting and creative',
  'Private community of people learning the same system',
  'Optional 1:1 campaign map call, free if you want help applying it',
];

const STATS = [
  ['1,200+', 'Brands tested'],
  ['500+', 'Clients'],
  ['12 yrs', 'In business'],
];

function joinCheckout(source: string) {
  trackStep('cta_click', { source });
  trackStep('cta_' + source);
  const w = window as TrackingWindow;
  w.fbq?.('track', 'InitiateCheckout', {
    content_name: PLAN.name,
    content_ids: [PLAN.contentId],
    content_type: 'product',
    value: PLAN.value,
    currency: 'USD',
    num_items: 1,
    page_variant: 'skool',
  });
  w.dataLayer?.push({ event: 'initiate_checkout', plan: 'monthly', page_variant: 'skool' });
  window.location.href = checkoutUrl(CHECKOUT_URL_MONTHLY);
}

function JoinButton({ source, id }: { source: string; id: string }) {
  return (
    <button
      id={id}
      onClick={() => joinCheckout(source)}
      className="w-full rounded-md bg-[#F5CD6A] px-4 py-3.5 text-base font-bold uppercase tracking-wide text-[#1F2023] transition-colors hover:bg-[#EDBF4E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F2023]/40"
    >
      Join $7/month
    </button>
  );
}

function SkoolStyle() {
  const [active, setActive] = useState<Media>(MEDIA[0]);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    trackStep('page_view');
    const stops = [observeSections(), trackTimeOnPage(), trackScrollDepth()];
    return () => stops.forEach((stop) => stop());
  }, []);

  // The video only loads once someone presses play.
  useEffect(() => {
    if (!playing || !videoRef.current) return;
    const stop = trackVideo(videoRef.current);
    videoRef.current.play().catch(() => {});
    return stop;
  }, [playing]);

  // Reviews widget (iframe + resize script) loads when the section gets close.
  useEffect(() => {
    const el = reviewsRef.current;
    if (!el) return;
    const load = () => {
      setShowReviews(true);
      if (!document.querySelector(`script[src="${REVIEWS_SCRIPT_SRC}"]`)) {
        const s = document.createElement('script');
        s.src = REVIEWS_SCRIPT_SRC;
        s.async = true;
        document.body.appendChild(s);
      }
    };
    if (!('IntersectionObserver' in window)) return load();
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = (m: Media) => {
    setActive(m);
    setPlaying(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1F2023]" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Top bar */}
      <header className="border-b border-[#E4E4E0] bg-white">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F2023] text-sm font-bold text-[#F5CD6A]">FC</div>
            <span className="text-lg font-semibold">Freedom Club</span>
          </div>
          <a
            href="https://learn.kenjiai.com/"
            className="rounded-md border border-[#E4E4E0] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#65676B] hover:bg-[#F7F7F5]"
          >
            Log in
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1100px] grid-cols-1 gap-4 px-4 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_288px] lg:gap-x-6 lg:gap-y-0">
        {/* Media + meta (left, top) */}
        <section
          data-track-section="hero"
          className="min-w-0 rounded-xl border border-[#E4E4E0] bg-white p-4 sm:p-8 lg:col-start-1 lg:row-start-1 lg:rounded-b-none lg:border-b-0 lg:pb-2"
        >
          <h1 className="mb-1 text-2xl font-bold">Freedom Club</h1>
          <p className="mb-4 text-sm text-[#65676B]">The Meta ads system tested with over 1,200 brands</p>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[#111]">
            {active.video && playing ? (
              <video
                ref={videoRef}
                src={VSL_SRC}
                poster="/club/poster.webp"
                title="Freedom Club video"
                controls
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full bg-black"
              />
            ) : active.video ? (
              <button
                id="video-play"
                onClick={() => setPlaying(true)}
                aria-label="Play the Freedom Club walkthrough video"
                className="group absolute inset-0 h-full w-full"
              >
                <img src={active.src} alt={active.alt} width={1280} height={720} fetchPriority="high" className="h-full w-full object-cover" />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-black/70 transition-colors group-hover:bg-black/85">
                  <Play className="h-7 w-7 fill-white text-white" />
                </span>
                <span className="absolute bottom-3 right-3 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">2:50</span>
              </button>
            ) : (
              <img src={active.src} alt={active.alt} decoding="async" className="absolute inset-0 h-full w-full object-contain" />
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
            {MEDIA.map((m) => (
              <button
                key={m.id}
                onClick={() => select(m)}
                aria-label={m.alt}
                aria-pressed={active.id === m.id}
                className={`relative h-[64px] w-[90px] shrink-0 overflow-hidden rounded-md border-2 bg-[#111] sm:h-[72px] sm:w-[100px] ${
                  active.id === m.id ? 'border-[#1F2023]' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={m.thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                {m.video && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-6 w-8 items-center justify-center rounded bg-black/70">
                      <Play className="h-3.5 w-3.5 fill-white text-white" />
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px] font-medium">
            <span className="flex items-center gap-2"><Lock className="h-5 w-5" />Private</span>
            <span className="flex items-center gap-2"><Tag className="h-5 w-5" />$7/month</span>
            <span className="flex items-center gap-2">
              <img src="/club/yousif-avatar.webp" alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
              By Yousif Alias
            </span>
          </div>
        </section>

        {/* Join card (right, sticky on desktop; after the media on phones) */}
        <aside data-track-section="join_card" className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-xl border border-[#E4E4E0] bg-white">
            <img
              src="/freedom-club-bundle-800w.webp"
              alt="The Freedom Club: everything you need, one place"
              width={800}
              height={420}
              decoding="async"
              className="aspect-[2.6/1] w-full object-cover object-top lg:aspect-[1.9/1]"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">Freedom Club</h2>
              <p className="mb-3 text-xs font-semibold text-[#65676B]">by KenjiAI</p>
              <p className="mb-4 text-[15px] leading-relaxed">
                Learn to run Meta ads that bring in paying clients. Beginners welcome, starts at $10/day in ad spend.
              </p>
              <div className="mb-4 grid grid-cols-3 border-y border-[#E4E4E0] py-3 text-center">
                {STATS.map(([v, l], i) => (
                  <div key={l} className={i ? 'border-l border-[#E4E4E0]' : ''}>
                    <div className="text-base font-semibold">{v}</div>
                    <div className="text-xs text-[#65676B]">{l}</div>
                  </div>
                ))}
              </div>
              <JoinButton source="join-card" id="join-card-cta" />
              <p className="mt-3 text-center text-xs text-[#65676B]">Instant access. Cancel anytime.</p>
            </div>
          </div>
        </aside>

        {/* Description, reviews, FAQ (left, below the media on desktop) */}
        <section className="min-w-0 rounded-xl border border-[#E4E4E0] bg-white p-4 sm:p-8 lg:col-start-1 lg:row-start-2 lg:rounded-t-none lg:border-t-0 lg:pt-4">
          <div data-track-section="about" className="space-y-4 text-[15px] leading-relaxed sm:text-base">
            <p>Learn the Meta ads system we use for our own clients, at your own pace.</p>
            <p>
              Freedom Club is where beginners learn to run ads that bring in paying clients. It's the same system behind
              The system we tested with over 1,200 brands, broken into short trainings you can start the day you join. You don't need
              a website or a big budget. It starts at $10/day in ad spend.
            </p>
            <p>Built by Yousif Alias and the KenjiAI team. 12 years running ads, 500+ clients served and $186K from a single funnel.</p>
          </div>

          <div data-track-section="inside" className="mt-6">
            <h3 className="mb-2 text-[15px] font-bold">What's inside</h3>
            <ul className="space-y-2 text-[15px] leading-relaxed">
              {TRAININGS.map(([t, d]) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  <span><span className="font-semibold">{t}.</span> {d}</span>
                </li>
              ))}
              {EXTRAS.map((e) => (
                <li key={e} className="flex gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          <div data-track-section="how_it_works" className="mt-6">
            <h3 className="mb-2 text-[15px] font-bold">How it works</h3>
            <ol className="space-y-1.5 text-[15px] leading-relaxed">
              <li>1. Join. You're inside the member area in under 60 seconds.</li>
              <li>2. Pick a template and drop your offer into one of the 30 hooks.</li>
              <li>3. Launch at $10/day, keep what works, and scale the ads that pay for themselves.</li>
            </ol>
          </div>

          <div className="mt-8 border-t border-[#E4E4E0] pt-6">
            <div ref={reviewsRef} data-track-section="reviews">
              <h3 className="mb-1 text-xl font-bold">What members say</h3>
              <p className="mb-4 text-sm text-[#65676B]">Real reviews of KenjiAI, pulled in live.</p>
              <div className="min-h-[560px] overflow-hidden rounded-lg sm:min-h-[420px]">
                {showReviews && (
                  <iframe
                    className="lc_reviews_widget min-h-[560px] sm:min-h-[420px]"
                    src={REVIEWS_IFRAME_SRC}
                    frameBorder="0"
                    scrolling="no"
                    loading="lazy"
                    style={{ minWidth: '100%', width: '100%' }}
                    title="KenjiAI Customer Reviews"
                  />
                )}
              </div>
              <p className="mt-4 text-xs text-[#65676B]">
                Results may vary. These reviews reflect individual experiences and are not a guarantee of income or ad performance.
              </p>
            </div>
          </div>

          <div data-track-section="faq" className="mt-8 border-t border-[#E4E4E0] pt-6">
            <h3 className="mb-3 text-xl font-bold">Questions</h3>
            <div className="divide-y divide-[#E4E4E0] rounded-lg border border-[#E4E4E0]">
              {FAQS.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#65676B] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-4 text-[15px] leading-relaxed text-[#3C3D40]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div data-track-section="final_cta" className="mx-auto mt-8 max-w-sm">
            <JoinButton source="final-cta" id="final-cta" />
            <p className="mt-3 text-center text-xs text-[#65676B]">Whenever you're ready. Cancel anytime.</p>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-10 pt-2 text-center text-xs leading-relaxed text-[#8A8B8F]">
        <p>&copy; 2026 Freedom Club. All rights reserved.</p>
        <p className="mt-1">Results vary. This is an educational product, not a guarantee of income.</p>
        <p className="mt-1">This site is not part of, and has not been reviewed, approved, or endorsed by Facebook/Meta or Google in any way.</p>
      </footer>
    </div>
  );
}

export default SkoolStyle;
