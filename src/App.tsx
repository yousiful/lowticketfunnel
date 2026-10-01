import { useState, useEffect, type ReactNode } from 'react';
import {
  CheckCircle2, Users, DollarSign, Lock, ArrowRight, Zap, Award,
  Star, ChevronDown, ChevronUp, Shield, Target, Sparkles, X, Gift, BookOpen, Video
} from 'lucide-react';

// Same GHL checkout used before. The Stripe price on the GHL side has moved
// more than once independent of this codebase ($4.75 -> $6.75 -> $7, as of
// 2026-08-11) - there's no live API reading the real price, so PLAN_DETAILS
// below has to be updated by hand whenever it changes on the GHL side, or
// the pixel value silently drifts from what's actually charged. No separate
// yearly plan exists. The price is deliberately never shown on this page;
// the GHL order form shows it.
const CHECKOUT_URL_MONTHLY = 'https://freedom.kenjiai.com/startnow';
const CHECKOUT_URL_LIFETIME = 'https://freedom.kenjiai.com/startnow';

type Plan = 'monthly' | 'lifetime';

type TrackingWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
};

/**
 * CTA button copy A/B test. Each visitor is assigned one variant on first
 * load, persisted in localStorage so returns stay consistent, and reported
 * to Meta Pixel + the GTM dataLayer so checkouts can be segmented by it.
 * Variant 'A' is the control. To retire the test, keep only the winner.
 */
type CTAVariant = { id: string; label: string };

const CTA_VARIANTS: CTAVariant[] = [
  { id: 'A', label: 'YES! I Want to Profit' },
  { id: 'B', label: 'I Want In' },
];

const CTA_STORAGE_KEY = 'kenji_cta_variant';

function pickCTAVariant(): CTAVariant {
  if (typeof window === 'undefined') return CTA_VARIANTS[0];
  let saved = '';
  try {
    saved = localStorage.getItem(CTA_STORAGE_KEY) || '';
  } catch {
    /* localStorage blocked (private mode), fall through to a random pick */
  }
  let variant = CTA_VARIANTS.find((v) => v.id === saved);
  if (!variant) {
    variant = CTA_VARIANTS[Math.floor(Math.random() * CTA_VARIANTS.length)];
    try {
      localStorage.setItem(CTA_STORAGE_KEY, variant.id);
    } catch {
      /* ignore persistence failure */
    }
  }
  return variant;
}

const FAQS = [
  {
    q: 'How much does this cost?',
    a: "It's a small monthly membership, billed monthly with no contracts. You'll see the exact price before you confirm at checkout. Cancel anytime, no hidden fees.",
  },
  {
    q: 'What exactly do I get?',
    a: 'Three things. The Freedom Club membership (Meta ad templates, 30 ad hooks, the AI prompt pack, 6 trainings and the private community). Pre-Converted, Yousif\'s book on attracting high-quality leads who pay you first. And if you are one of the first 50 members, a done-for-you VSL script for your offer.',
  },
  {
    q: 'How does the done-for-you VSL script work?',
    a: "After you join, you fill out a short intake form about your offer. Yousif's team writes a custom VSL (video sales letter) script for it. You record it yourself, on your phone if you want. It's only for the first 50 members. Once 50 are claimed, this bonus comes off the page.",
  },
  {
    q: 'What if the 50 VSL script spots are already claimed?',
    a: 'Then the bonus comes off this page. The membership and the book stay exactly the same.',
  },
  {
    q: 'What happens after I buy?',
    a: "You get instant access to the trainings, templates, prompt pack, the book and the community. You'll be inside the member area in under 60 seconds.",
  },
  {
    q: 'Do I need a website?',
    a: 'No. You can use any page builder you like, or send people straight to a booking link or your DMs.',
  },
  {
    q: 'Do I need a big ad budget?',
    a: 'No. The system is designed to work starting at $10/day in ad spend.',
  },
  {
    q: 'Is the 1:1 call required?',
    a: 'No. The 1:1 campaign map call is optional and free. You can use the product fully without it. If you want help applying the system, you can book a call at any time.',
  },
  {
    q: 'Will you call or text me?',
    a: 'Only if you book a 1:1 call. We will not contact you by phone unless you request it.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel with one click, no questions, no hassle. You keep access until the end of your billing period.',
  },
  {
    q: "What if I'm a complete beginner?",
    a: 'The training starts from zero. No prior ad experience needed.',
  },
  {
    q: 'What platforms does this cover?',
    a: 'Facebook and Instagram, through Meta Ads.',
  },
  {
    q: 'Do I need to use AI tools?',
    a: 'The system includes an AI prompt pack, but AI tools are optional. The templates and strategies work with or without AI.',
  },
];

/**
 * Top bar, honest version. No fake countdown and no "X spots left" counter.
 * This codebase had a rolling 48h per-visitor timer that never actually
 * expired; it had been added, called out as fake scarcity, and removed twice
 * before. Do not reintroduce one. The bar states a plain operational fact
 * instead: the done-for-you VSL script bonus is capped at the first 50
 * members and comes off the page once they are claimed. Nothing counts down
 * and nothing claims a number the page cannot back up.
 */
function UrgencyBar() {
  const scrollToStack = () =>
    document.getElementById('the-stack')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative z-50 w-full bg-[#E61428] text-white border-b-2 border-black">
      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:flex-row sm:gap-4">
        <p className="flex items-center gap-1.5 text-xs font-bold sm:text-sm">
          <Gift className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>
            <span className="font-black uppercase">Limited bonus:</span> a done-for-you VSL script for the first 50 members.
          </span>
        </p>
        <button
          onClick={scrollToStack}
          className="shrink-0 rounded-full border-2 border-black bg-[#FFE600] px-4 py-1 text-xs font-black uppercase tracking-wide text-black transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          See the stack
        </button>
      </div>
    </div>
  );
}

/**
 * Exit-intent recovery popup. Fires once per browser session, on whichever
 * comes first: the mouse leaving toward the browser chrome (desktop) or a
 * 45s idle timer (covers mobile, where there's no real exit signal). Never
 * shows price. Deliberately framed as a low-investment, take-it-seriously
 * nudge instead of a discount.
 */
const EXIT_POPUP_SESSION_KEY = 'kenji_exit_popup_shown';
const EXIT_POPUP_IDLE_MS = 45000;

function ExitIntentPopup({ ctaLabel, onCTA, onClose }: { ctaLabel: string; onCTA: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-heading"
      onClick={onClose}
    >
      <style>{`
        @keyframes exitPopIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
      <div
        className="relative w-full max-w-md bg-[#0d0d0d] border-[3px] border-[#FFE600] rounded-2xl p-7 sm:p-8 shadow-[8px_8px_0_#E61428]"
        style={{ animation: 'exitPopIn 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-neutral-200 px-3 py-1.5 rounded-full text-xs font-bold mb-5">
            <Shield className="w-3.5 h-3.5" />
            Before you close this tab
          </div>

          <h3 id="exit-popup-heading" className="thumb-stroke thumb-yellow text-4xl font-black uppercase mb-4 leading-none">
            Wait.
            <span className="block text-white text-2xl mt-2">Before you go.</span>
          </h3>

          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed mb-6">
            This is a very low monthly investment. Low enough to say yes today, real enough that you'll actually show up and use it. Hundreds of entrepreneurs just like you already are. You also get the book, and the first 50 members get a done-for-you VSL script.
          </p>

          <button
            onClick={onCTA}
            className="cta-pop w-full group font-black uppercase text-base sm:text-lg px-6 py-4 rounded-xl inline-flex items-center justify-center gap-2 mb-4"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 text-xs underline underline-offset-2 transition-colors"
          >
            No thanks, I'll pass
          </button>
        </div>
      </div>
    </div>
  );
}

// Paste the VSL embed URL here once it's filmed; the ad still shows until then.
const VSL_EMBED_URL = '/videos/freedom-club-vsl.mp4';

const REVIEWS_SCRIPT_SRC = 'https://reputationhub.site/reputation/assets/review-widget.js';
const REVIEWS_IFRAME_SRC = 'https://reputationhub.site/reputation/widgets/review_widget/q5L4ttbBMHNxieXIcTVJ';

const TRAININGS = [
  {
    icon: Target,
    title: 'Self-Liquidating Meta Ad Campaigns',
    copy: 'Build ad campaigns structured to pay for themselves on the front end, so your ad spend funds its own scale instead of draining your bank account.',
  },
  {
    icon: Sparkles,
    title: 'The AI Tools I Use For Paid Ads',
    copy: 'The exact AI tools used to make realistic, scroll-stopping ad creative. No camera crew, no designer, no waiting on an agency.',
  },
  {
    icon: Award,
    title: 'How To Close Deals From Paid Ads',
    copy: 'Turn a paid ad lead into a closed deal. The real process from first reply to signed client.',
  },
  {
    icon: Users,
    title: 'Client Attraction Secrets',
    copy: 'The positioning and outreach system that gets high-quality clients reaching out to you first, instead of you chasing them.',
  },
  {
    icon: Shield,
    title: 'Paid Ads Certified Course',
    copy: 'A structured, certified path through paid traffic so you are not guessing your way through Meta and Google.',
  },
  {
    icon: DollarSign,
    title: 'The $1 Lead Method',
    copy: 'How to generate qualified leads for about a dollar each, without a giant ad budget behind it.',
  },
];

const PAINS = [
  'You boosted a post. Meta said thank you. Your bank account did not.',
  'You ran a real campaign. It lost money with total confidence.',
  'Targeting, bidding, pixels, algorithm updates. You just wanted a customer.',
  'Agencies want $2,000+ a month to guess with your money.',
  'Your income rides on organic reach and whoever remembers to refer you.',
];

function SectionTag({ children, tone = 'yellow' }: { children: ReactNode; tone?: 'yellow' | 'red' }) {
  const cls =
    tone === 'red'
      ? 'bg-[#E61428] text-white'
      : 'bg-[#FFE600] text-black';
  return (
    <span className={`inline-block ${cls} border-2 border-black rounded-full px-4 py-1 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0_#000]`}>
      {children}
    </span>
  );
}

function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (document.querySelector(`script[src="${REVIEWS_SCRIPT_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = REVIEWS_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);
  const [cta] = useState<CTAVariant>(pickCTAVariant);
  const [showExit, setShowExit] = useState(false);

  // Report the assigned CTA variant once so checkouts can be segmented by it.
  useEffect(() => {
    const w = window as TrackingWindow;
    w.fbq?.('trackCustom', 'CTAVariant', { variant: cta.id });
    w.dataLayer?.push({ event: 'cta_variant_assigned', cta_variant: cta.id });
  }, [cta]);

  // Exit-intent recovery: fires once per session on mouse-leave-to-top
  // (desktop) or a 45s idle fallback (covers mobile, no real exit signal).
  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(EXIT_POPUP_SESSION_KEY) === '1';
    } catch {
      /* sessionStorage blocked (private mode), allow it once per mount instead */
    }
    if (alreadySeen) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setShowExit(true);
      try {
        sessionStorage.setItem(EXIT_POPUP_SESSION_KEY, '1');
      } catch {
        /* ignore persistence failure */
      }
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener('mouseleave', onMouseLeave);
    const idleTimer = setTimeout(trigger, EXIT_POPUP_IDLE_MS);

    return () => {
      document.removeEventListener('mouseleave', onMouseLeave);
      clearTimeout(idleTimer);
    };
  }, []);

  const PLAN_DETAILS: Record<Plan, { name: string; contentId: string; value: number; url: string }> = {
    monthly: { name: 'Freedom Club - Monthly Membership', contentId: 'ace-monthly', value: 7.00, url: CHECKOUT_URL_MONTHLY },
    lifetime: { name: 'Freedom Club - Lifetime Access', contentId: 'ace-27-79-lifetime', value: 27.79, url: CHECKOUT_URL_LIFETIME },
  };

  const handleCTAClick = (plan: Plan) => {
    const w = window as TrackingWindow;
    const details = PLAN_DETAILS[plan];
    w.fbq?.('track', 'InitiateCheckout', {
      content_name: details.name,
      content_ids: [details.contentId],
      content_type: 'product',
      value: details.value,
      currency: 'USD',
      num_items: 1,
      cta_variant: cta.id,
    });
    w.dataLayer?.push({ event: 'initiate_checkout', plan, cta_variant: cta.id });
    window.location.href = details.url;
  };

  const handleExitCTA = () => {
    const w = window as TrackingWindow;
    w.fbq?.('trackCustom', 'ExitPopupCTA');
    w.dataLayer?.push({ event: 'exit_popup_cta_click' });
    handleCTAClick('monthly');
  };

  const CTAButton = ({ id, big = false, full = false }: { id: string; big?: boolean; full?: boolean }) => (
    <button
      onClick={() => handleCTAClick('monthly')}
      id={id}
      className={`cta-pop group font-black uppercase tracking-tight rounded-2xl inline-flex items-center justify-center gap-3 ${
        big ? 'text-lg sm:text-2xl px-5 sm:px-14 py-5 sm:py-6' : 'text-base sm:text-xl px-5 sm:px-12 py-4 sm:py-5'
      } ${full ? 'w-full sm:w-auto' : ''}`}
    >
      <span>{cta.label}</span>
      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
    </button>
  );

  return (
    <div className="cin-bg min-h-screen text-white overflow-x-clip">
      <UrgencyBar />

      {/* Trust strip */}
      <div className="bg-black/90 text-white py-2.5 px-4 text-center sticky top-0 z-40 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-xs sm:text-sm font-semibold">
          <span className="flex items-center gap-1.5 text-[#FFE600]">
            <Star className="w-4 h-4 fill-[#FFE600]" />
            Premium Membership
          </span>
          <span className="text-neutral-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <Zap className="w-4 h-4 text-[#FFE600]" />
            Instant Access
          </span>
          <span className="text-neutral-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-neutral-300">
            <DollarSign className="w-4 h-4 text-[#FFE600]" />
            $3.35M generated for clients
          </span>
        </div>
      </div>

      {/* ==================== HERO ==================== */}
      <section className="relative">
        <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-16">
          <div className={VSL_EMBED_URL ? 'text-center' : 'grid md:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12 items-center'}>
            <div className={VSL_EMBED_URL ? '' : 'text-center md:text-left'}>
              <div className="mb-5 sm:mb-7">
                <SectionTag>Freedom Club · built for beginners</SectionTag>
              </div>

              <h1 className="font-black uppercase leading-[0.95] tracking-tight mb-6">
                <span className="thumb-stroke block text-white text-2xl sm:text-4xl lg:text-[2.6rem]">
                  Learn Meta ads once
                </span>
                <span className="thumb-stroke thumb-yellow block text-5xl sm:text-7xl lg:text-8xl mt-2">
                  Make money two ways
                </span>
                <span className="pill-red mt-5 px-3 sm:px-4 py-1.5 text-lg sm:text-2xl lg:text-3xl">
                  Your business or theirs.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-neutral-300 mb-6 max-w-2xl leading-relaxed mx-auto">
                Run ads that bring more customers into your own business, or learn the skill and get paid running ads for other businesses. Freedom Club gives you the Meta ads system behind <span className="text-[#FFE600] font-bold">$3.35M generated for our clients</span>, built for people who've never run an ad. Templates, 30 hooks, AI prompts, 6 trainings, the community, plus Yousif's book <span className="text-white font-bold whitespace-nowrap">Pre-Converted</span>. Built to start at $10/day in ad spend.
              </p>

              <div className="mb-7 inline-flex items-start gap-2.5 bg-[#E61428]/15 border-2 border-[#E61428] rounded-xl px-4 py-3 text-left max-w-xl">
                <Gift className="w-5 h-5 text-[#FFE600] flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-white leading-snug">
                  <span className="font-black uppercase text-[#FFE600]">Limited bonus:</span> the first 50 members get a done-for-you VSL script written for their offer.
                </p>
              </div>

              {VSL_EMBED_URL && (
                <div className="mb-8 max-w-3xl mx-auto">
                  <div className="relative w-full overflow-hidden rounded-2xl border-[3px] border-black shadow-[8px_8px_0_#E61428]" style={{ paddingTop: '56.25%' }}>
                    <video
                      src={VSL_EMBED_URL}
                      poster="/videos/freedom-club-vsl-poster.jpg"
                      title="Freedom Club video"
                      controls
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full bg-black"
                    />
                  </div>
                </div>
              )}

              <div>
                <CTAButton id="hero-cta" full />
                <p className="text-neutral-400 text-xs sm:text-sm mt-4">
                  Instant access · Cancel anytime in one click
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== PROOF STRIP ==================== */}
      <section className="bg-[#FFE600] text-black border-y-[3px] border-black py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          {[
            { stat: '$3.35M', label: 'generated for our clients' },
            { stat: '500+', label: 'clients served' },
            { stat: '$186K', label: 'from a single funnel' },
            { stat: '12 yrs', label: 'in business' },
          ].map((p) => (
            <div key={p.stat}>
              <div className="text-3xl sm:text-5xl font-black tracking-tight">{p.stat}</div>
              <div className="text-xs sm:text-sm font-bold uppercase mt-1">{p.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TWO PATHS ==================== */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <SectionTag tone="red">Pick your path</SectionTag>
            <h2 className="thumb-stroke text-4xl sm:text-6xl font-black uppercase leading-[0.95] mt-5 mb-4">
              One skill. <span className="thumb-yellow">Two ways</span> to get paid.
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto">
              Every business needs customers. The people who can bring them in with ads never run out of work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 sm:mb-16 max-w-5xl mx-auto">
            {[
              {
                tag: 'Path 1',
                title: 'Grow your own business',
                points: [
                  'Run Meta ads that bring in real buyers, starting at $10/day',
                  'Use the $1 lead method so ad spend stops disappearing',
                  'Close more of the leads you get with the sales trainings',
                ],
                accent: '#FFE600',
              },
              {
                tag: 'Path 2',
                title: 'Get paid to run ads for other businesses',
                points: [
                  'Learn the same system we use for our own clients',
                  'Earn the Paid Ads certificate and show proof of the skill',
                  'Land your first client with the Client Attraction training',
                ],
                accent: '#E61428',
              },
            ].map((p) => (
              <div key={p.tag} className="bg-white/[0.04] border-[3px] border-black rounded-2xl p-6 sm:p-8" style={{ boxShadow: `8px 8px 0 ${p.accent}` }}>
                <span className="inline-block font-black uppercase text-sm px-3 py-1 rounded-md border-2 border-black text-black" style={{ background: p.accent === '#E61428' ? '#fff' : p.accent }}>
                  {p.tag}
                </span>
                <h3 className="thumb-stroke text-white font-black uppercase text-2xl sm:text-3xl leading-tight mt-4 mb-5">{p.title}</h3>
                <ul className="space-y-3">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-neutral-200 text-sm sm:text-base leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-[#FFE600] flex-shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto mb-6">
            Either way, here's what's been stopping you:
          </p>

          <div className="max-w-3xl mx-auto space-y-3 mb-12">
            {PAINS.map((pain) => (
              <div key={pain} className="flex items-start gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-4 sm:p-5">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#E61428] border-2 border-black flex items-center justify-center">
                  <X className="w-4 h-4 text-white" strokeWidth={3} />
                </span>
                <p className="text-neutral-200 text-sm sm:text-base leading-relaxed pt-0.5">{pain}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto text-center bg-[#FFE600] text-black border-[3px] border-black rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0_#E61428]">
            <p className="font-black uppercase text-2xl sm:text-3xl leading-tight mb-3">
              Nobody taught you the system.
            </p>
            <p className="font-medium leading-relaxed">
              The people making money with ads run a tested system. Freedom Club hands you ours, the same one behind $3.35M generated for our clients.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== THE STACK ==================== */}
      <section id="the-stack" className="relative bg-black border-y border-white/10 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <SectionTag>The stack</SectionTag>
            <h2 className="thumb-stroke text-4xl sm:text-6xl font-black uppercase leading-[0.95] mt-5 mb-4">
              Here's <span className="thumb-yellow">everything</span> you get
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto">
              One membership. Three pieces. All of it opens the second you join.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-6 mb-12">
            {/* 1. Membership */}
            <div className="flex flex-col bg-[#111] border-2 border-white/15 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#FFE600] font-black text-4xl leading-none">01</span>
                <Users className="w-6 h-6 text-[#FFE600]" />
              </div>
              <h3 className="text-2xl font-black uppercase leading-tight mb-3">Freedom Club Membership</h3>
              <ul className="space-y-2.5 mb-6 text-neutral-300 text-sm sm:text-base">
                {[
                  'Meta ad campaign templates',
                  '30 ad hooks ready to plug in',
                  'AI prompt pack',
                  '6 trainings (listed below)',
                  'The private community',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#FFE600] flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-white/10 pt-4">
                <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Value</p>
                <p className="text-white font-bold">The full system our team runs for clients, built to start at $10/day</p>
              </div>
            </div>

            {/* 2. The book */}
            <div className="flex flex-col bg-[#111] border-2 border-white/15 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#FFE600] font-black text-4xl leading-none">02</span>
                <BookOpen className="w-6 h-6 text-[#FFE600]" />
              </div>
              <h3 className="text-2xl font-black uppercase leading-tight mb-3">Pre-Converted</h3>
              <div className="flex gap-4 items-start mb-4">
                <picture className="flex-shrink-0">
                  <source type="image/webp" srcSet="/preconverted-cover-600w.webp" />
                  <img
                    src="/preconverted-cover.jpg"
                    alt="Pre-Converted by Yousif Alias: How to Get High-Quality Leads Who Pay You First"
                    width={300}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="w-24 sm:w-28 rounded-lg border-2 border-black shadow-[4px_4px_0_#FFE600]"
                  />
                </picture>
                <p className="text-neutral-300 text-sm sm:text-base">The book by Yousif Alias on getting high-quality leads who pay you first.</p>
              </div>
              <ul className="space-y-2.5 mb-6 text-neutral-300 text-sm sm:text-base">
                {[
                  'Attract leads who are ready to buy before they talk to you',
                  'Flip it so prospects chase you',
                  'The pre-sell sequence that gets people to pay first, not haggle later',
                  'Templates and scripts you can deploy this week',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#FFE600] flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-white/10 pt-4">
                <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Value</p>
                <p className="text-[#FFE600] font-black text-2xl">$97</p>
              </div>
            </div>

            {/* 3. Bonus: DFY VSL script */}
            <div className="relative flex flex-col bg-[#1a0507] border-[3px] border-[#E61428] rounded-2xl p-6 sm:p-7 shadow-[8px_8px_0_#E61428]">
              <div className="absolute -top-4 right-4">
                <span className="pill-red px-3 py-1 text-xs sm:text-sm font-black uppercase">First 50 members only</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#FFE600] font-black text-4xl leading-none">03</span>
                <Video className="w-6 h-6 text-[#FFE600]" />
              </div>
              <p className="text-[#FFE600] text-xs font-black uppercase tracking-wider mb-1">Limited bonus</p>
              <h3 className="text-2xl font-black uppercase leading-tight mb-3">Done-For-You VSL Script</h3>
              <p className="text-neutral-300 text-sm sm:text-base mb-4">
                A video sales letter sells your offer while you sleep. Most people never write one because staring at a blank page is miserable. So we write it for you.
              </p>
              <ol className="space-y-2.5 mb-5 text-neutral-200 text-sm sm:text-base">
                {[
                  'Join Freedom Club',
                  'Fill out a short intake form about your offer',
                  "Yousif's team writes a custom VSL script for it",
                  'You record it yourself and run it',
                ].map((t, i) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FFE600] text-black text-xs font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <p className="text-white font-bold text-sm sm:text-base bg-black/40 border border-white/10 rounded-lg p-3 mb-5">
                Only for the first 50 members. Once 50 are claimed, this bonus comes off the page.
              </p>
              <div className="mt-auto border-t border-white/10 pt-4">
                <p className="text-xs uppercase font-bold text-neutral-500 tracking-wider">Value</p>
                <p className="text-white font-bold">A custom script written around your offer by the team behind $3.35M generated for clients</p>
              </div>
            </div>
          </div>

          {/* Value stack receipt */}
          <div className="max-w-2xl mx-auto bg-[#0d0d0d] border-[3px] border-[#FFE600] rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0_#E61428]">
            <h3 className="thumb-stroke thumb-yellow text-2xl sm:text-3xl font-black uppercase text-center mb-6">What you walk away with</h3>
            <ul className="divide-y divide-white/10 mb-6">
              {[
                { item: 'Freedom Club membership', value: 'Templates, 30 hooks, AI prompts, 6 trainings, community' },
                { item: 'Pre-Converted (the book)', value: '$97 value' },
                { item: 'Done-for-you VSL script', value: 'First 50 members only' },
              ].map((r) => (
                <li key={r.item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3">
                  <span className="flex items-center gap-2.5 text-white font-bold">
                    <CheckCircle2 className="w-5 h-5 text-[#FFE600] flex-shrink-0" />
                    {r.item}
                  </span>
                  <span className="text-neutral-400 text-sm sm:text-right pl-7 sm:pl-0">{r.value}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <CTAButton id="stack-cta" full />
              <p className="text-neutral-500 text-xs mt-4">You'll see the exact price on the next page before you confirm. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== INSIDE THE MEMBER AREA ==================== */}
      {/*
        No screenshots by design - members asked to see the actual value of
        each training instead of a dashboard mockup. This lists the real
        courses inside Freedom Club with what each one does for you.
      */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <SectionTag>
              <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Your login works the second you join</span>
            </SectionTag>
            <h2 className="thumb-stroke text-4xl sm:text-6xl font-black uppercase leading-[0.95] mt-5 mb-4">
              Here's what you get <span className="thumb-yellow">when you log in</span>
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto">
              No mystery and no waiting around. Every training below is open to you from day one.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 mb-10">
            {TRAININGS.map((course, i) => (
              <div
                key={course.title}
                className="bg-[#111] border-2 border-white/10 hover:border-[#FFE600]/60 transition-colors rounded-2xl p-5 sm:p-6 flex gap-4 items-start"
              >
                <div className="shrink-0 bg-[#FFE600] text-black border-2 border-black rounded-xl p-2.5 shadow-[3px_3px_0_#E61428]">
                  <course.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[#FFE600] text-xs font-black uppercase tracking-wider mb-1">Training {i + 1}</p>
                  <h3 className="text-white font-black text-lg mb-1.5 leading-tight">{course.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{course.copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto bg-[#111] border-2 border-[#FFE600]/40 rounded-2xl p-6 mb-10 text-center">
            <p className="text-neutral-400 text-sm mb-1">All 6 trainings above</p>
            <p className="text-[#FFE600] font-black text-2xl uppercase mb-1">Open the second you join</p>
            <p className="text-neutral-500 text-xs">Built by the team behind $3.35M generated for 500+ clients</p>
          </div>

          <div className="text-center">
            <CTAButton id="dashboard-cta" />
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="bg-black border-y border-white/10 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="thumb-stroke text-4xl sm:text-6xl font-black uppercase text-center leading-[0.95] mb-10 sm:mb-14">
            How it <span className="thumb-yellow">works</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: '1', t: 'Join', d: "You're inside the member area in under 60 seconds." },
              { n: '2', t: 'Pick a template', d: 'Drop your offer into a proven campaign template and one of the 30 hooks.' },
              { n: '3', t: 'Launch at $10/day', d: 'Start small, keep what works, and scale the ads that pay for themselves.' },
              { n: '4', t: 'Claim your VSL script', d: 'First 50 members: fill out the intake form and our team writes your script.' },
            ].map((step) => (
              <div key={step.n} className="bg-[#111] border-2 border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-[#FFE600] text-black border-[3px] border-black font-black text-xl flex items-center justify-center mb-4 shadow-[3px_3px_0_#E61428]">{step.n}</div>
                <h3 className="text-white font-black uppercase text-lg mb-1.5">{step.t}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== OBJECTIONS ==================== */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="thumb-stroke text-4xl sm:text-5xl font-black uppercase text-center leading-[0.95] mb-10">
            Built for where you are <span className="thumb-yellow">right now</span>
          </h2>
          <div className="space-y-4">
            {[
              { q: "“I've never run an ad.”", a: 'Good. The training starts from zero and walks you through your first campaign.' },
              { q: "“I don't have a big budget.”", a: "You don't need one. The system is built to start at $10/day." },
              { q: "“I don't have a website.”", a: 'Send people to a booking link or your DMs. No site required.' },
              { q: "“An agency already burned me.”", a: "That's why this teaches you the system yourself. No retainer, no contract." },
            ].map((o) => (
              <div key={o.q} className="flex gap-4 items-start bg-white/[0.04] border border-white/10 rounded-xl p-5">
                <CheckCircle2 className="w-6 h-6 text-[#FFE600] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-black text-lg">{o.q}</p>
                  <p className="text-neutral-400 text-sm sm:text-base mt-1 leading-relaxed">{o.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== REVIEWS (real GHL widget) ==================== */}
      <section className="bg-black border-y border-white/10 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <SectionTag>Real reviews</SectionTag>
            <h2 className="thumb-stroke text-4xl sm:text-6xl font-black uppercase leading-[0.95] mt-5 mb-4">
              What our members <span className="thumb-yellow">are saying</span>
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg">
              Real results from real entrepreneurs
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 max-w-4xl mx-auto">
            {[
              { icon: Users, text: 'Join hundreds of entrepreneurs just like you' },
              { icon: Award, text: '12 years in business' },
              { icon: DollarSign, text: '$3.35M generated for 500+ clients' },
            ].map((b) => (
              <div key={b.text} className="flex items-center justify-center gap-2 bg-[#111] border border-white/10 rounded-xl py-3.5 px-5">
                <b.icon className="w-5 h-5 text-[#FFE600] flex-shrink-0" />
                <span className="text-white font-bold text-sm sm:text-base">{b.text}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden">
            {/* min-height fallback: the iframe renders 0-tall on mobile if the resize script loads late. */}
            <iframe
              className="lc_reviews_widget min-h-[560px] sm:min-h-[420px]"
              src={REVIEWS_IFRAME_SRC}
              frameBorder="0"
              scrolling="no"
              style={{ minWidth: '100%', width: '100%' }}
              title="KenjiAI Customer Reviews"
            />
          </div>
          <p className="text-neutral-600 text-xs text-center mt-6 max-w-xl mx-auto">
            Results may vary. These reviews reflect individual experiences and are not a guarantee of income or ad performance.
          </p>
          <p className="text-[#FFE600]/80 text-sm text-center mt-4 font-semibold">
            Got a win from the training? Screenshot it and send it to support, yours could be the next one featured here.
          </p>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="thumb-stroke text-4xl sm:text-5xl font-black uppercase text-center leading-[0.95] mb-10 sm:mb-12">
            Common <span className="thumb-yellow">questions</span>
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className={`bg-[#111] border-2 rounded-xl overflow-hidden transition-colors ${openFaq === i ? 'border-[#FFE600]/60' : 'border-white/10'}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.03] transition-colors"
                  id={`faq-${i}`}
                  aria-expanded={openFaq === i}
                >
                  <span className="text-white font-bold pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-[#FFE600] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-white/10">
                    <p className="text-neutral-300 leading-relaxed pt-4 text-sm sm:text-base">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative bg-black border-t-[3px] border-[#FFE600] py-20 sm:py-28 px-4 overflow-hidden">
        <div className="grain pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,230,0,0.14), transparent 70%)' }} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-black uppercase leading-[0.95] mb-8">
            <span className="thumb-stroke block text-white text-2xl sm:text-4xl">Your business or theirs</span>
            <span className="thumb-stroke thumb-yellow block text-5xl sm:text-7xl mt-2">Start making money with ads</span>
          </h2>

          <div className="bg-[#0d0d0d] border-2 border-white/15 rounded-2xl p-6 sm:p-8 mb-8">
            <ul className="text-left max-w-md mx-auto space-y-2.5 mb-7">
              {[
                'Freedom Club membership',
                'Pre-Converted, the book ($97 value)',
                'Done-for-you VSL script (first 50 members only)',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-white font-bold">
                  <CheckCircle2 className="w-5 h-5 text-[#FFE600] flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-[#FFE600] text-sm font-bold mb-2">
              Access is only open for a limited time.
            </p>
            <p className="text-neutral-400 text-sm mb-8">
              Instant access · Cancel anytime · $3.35M generated for our clients
            </p>

            <CTAButton id="final-cta" big full />

            <div className="flex items-center justify-center gap-6 mt-7 text-neutral-400 text-xs flex-wrap">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Instant Access
              </span>
            </div>
          </div>

          <p className="text-neutral-400 text-sm">
            Once we close enrollment, this page comes down and you'll have to wait until we open it again.
          </p>
          <p className="text-neutral-500 text-sm mt-3 italic">
            Or don't. Close the tab, keep running the same ads the same way, and see where that gets you.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] py-8 px-4 pb-28 sm:pb-8 text-center text-neutral-500 text-sm border-t border-white/10">
        <p>&copy; 2026 Freedom Club. All rights reserved.</p>
        <p className="mt-2 text-neutral-600">Results vary. This is an educational product, not a guarantee of income.</p>
        <p className="mt-1 text-neutral-600">This site is not part of, and has not been reviewed, approved, or endorsed by Facebook/Meta or Google in any way.</p>
      </footer>

      {/* Sticky Mobile Bottom CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t-2 border-[#FFE600] px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => handleCTAClick('monthly')}
          id="sticky-mobile-cta"
          className="w-full bg-[#FFE600] text-black font-black uppercase text-base px-5 py-3.5 rounded-xl border-[3px] border-black shadow-[4px_4px_0_#E61428] inline-flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5"
        >
          <span>{cta.label}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {showExit && (
        <ExitIntentPopup ctaLabel={cta.label} onCTA={handleExitCTA} onClose={() => setShowExit(false)} />
      )}
    </div>
  );
}

export default App;
