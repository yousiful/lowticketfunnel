import { useState, useEffect, useRef } from 'react';
import { trackStep, observeSections, trackTimeOnPage, trackVideo } from './funnelTrack';
import {
  CheckCircle2, Users, DollarSign, Lock, ArrowRight, Zap, Award,
  Star, ChevronDown, ChevronUp, Shield, Target, Sparkles, Clock, X
} from 'lucide-react';

// Same GHL checkout used before. The Stripe price on the GHL side has moved
// more than once independent of this codebase ($4.75 -> $6.75 -> $7, as of
// 2026-08-11) - there's no live API reading the real price, so PLAN_DETAILS
// below has to be updated by hand whenever it changes on the GHL side, or
// the pixel value silently drifts from what's actually charged. No separate
// yearly plan exists.
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
  { id: 'ads-money', label: 'YES! I Want To Make Money With Ads' },
];

const CTA_STORAGE_KEY = 'kenji_cta_variant';

function pickCTAVariant(): CTAVariant {
  if (typeof window === 'undefined') return CTA_VARIANTS[0];
  let saved = '';
  try {
    saved = localStorage.getItem(CTA_STORAGE_KEY) || '';
  } catch {
    /* localStorage blocked (private mode) — fall through to a random pick */
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
    q: 'What happens after I buy?',
    a: "You get instant access to the full training, templates, prompt pack, and community. You'll be inside the member area in under 60 seconds.",
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
 * Urgency bar, honest version. No fake countdown - this codebase had one
 * (a rolling 48h per-visitor timer that never actually expired) and it had
 * already been added, called out as fake scarcity, and removed twice
 * before. Do not reintroduce one. The urgency here is a plain statement of
 * a real operational fact instead: enrollment is a limited-time window and
 * this page comes down when it closes. Nothing counts down and nothing
 * claims a specific deadline the offer cannot keep.
 */
function UrgencyBar() {
  const scrollToCTA = () =>
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 28px, transparent 28px 56px)' }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:flex-row sm:gap-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Access is open for a limited time. When it closes, this page comes down.
        </p>
        <button
          onClick={scrollToCTA}
          className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-violet-700 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          Sign up →
        </button>
      </div>
    </div>
  );
}

/**
 * Exit-intent recovery popup. Fires once per browser session, on whichever
 * comes first: the mouse leaving toward the browser chrome (desktop) or a
 * 45s idle timer (covers mobile, where there's no real exit signal). Never
 * shows price — deliberately framed as a low-investment, take-it-seriously
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-heading"
      onClick={onClose}
    >
      <style>{`
        @keyframes exitFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes exitPopIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
      <div
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border border-violet-500/30 rounded-2xl p-8 shadow-2xl"
        style={{ animation: 'exitPopIn 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1.5 rounded-full text-xs font-bold mb-5">
            <Shield className="w-3.5 h-3.5" />
            Before you close this tab
          </div>

          <h3 id="exit-popup-heading" className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
            Wait. Before you go.
          </h3>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            This isn't a knockoff freebie you'll forget about. It's a very low monthly investment, low enough to say yes today, real enough that you'll actually show up and use it. Hundreds of entrepreneurs just like you already are.
          </p>

          <button
            onClick={onCTA}
            className="cta-glow w-full group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-base sm:text-lg px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(20,184,166,0.6)] transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50 gap-2 mb-4"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-400 text-xs underline underline-offset-2 transition-colors"
          >
            No thanks, I'll pass
          </button>
        </div>
      </div>
    </div>
  );
}

// Freedom Club walkthrough VSL, shown first thing in the hero.
const VSL_EMBED_URL = '/videos/freedom-club-vsl.mp4';

const REVIEWS_SCRIPT_SRC = 'https://reputationhub.site/reputation/assets/review-widget.js';
const REVIEWS_IFRAME_SRC = 'https://reputationhub.site/reputation/widgets/review_widget/q5L4ttbBMHNxieXIcTVJ';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Funnel drop-off tracking (see funnelTrack.ts and kenjiai.com/funnel-stats/).
  useEffect(() => {
    trackStep('page_view');
    const stopSections = observeSections();
    const stopTimer = trackTimeOnPage();
    const stopVideo = videoRef.current ? trackVideo(videoRef.current) : () => {};
    return () => {
      stopSections();
      stopTimer();
      stopVideo();
    };
  }, []);
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
      /* sessionStorage blocked (private mode) — allow it once per mount instead */
    }
    if (alreadySeen) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setShowExit(true);
      trackStep('exit_popup_shown');
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

  const handleCTAClick = (plan: Plan, source = 'unknown') => {
    trackStep('cta_click', { source });
    trackStep('cta_' + source);
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
    handleCTAClick('monthly', 'exit-popup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <UrgencyBar />
      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 px-4 text-center sticky top-0 z-40 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Premium Membership
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Zap className="w-4 h-4 text-cyan-400" />
            Instant Access
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Users className="w-4 h-4 text-blue-400" />
            Hundreds of Entrepreneurs
          </span>
        </div>
      </div>

      {/* ==================== HERO SECTION ==================== */}
      {/* Video first so visitors see it without scrolling, short headline under it. */}
      <div data-track-section="hero" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10 pb-8 sm:pb-12">
        <div className="text-center">
          <p className="text-sm sm:text-lg font-bold text-cyan-300 mb-3 sm:mb-5">
            Watch this first: how beginners get paying clients with Meta ads
          </p>

          <div className="mb-6 sm:mb-8 max-w-3xl mx-auto">
            <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl shadow-cyan-500/10 border border-slate-700/50" style={{ paddingTop: '56.25%' }}>
              <video
                ref={videoRef}
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

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-5 leading-[1.1] tracking-tight px-1 sm:px-0">
            The Meta Ads System Behind
            <span className="block bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              $3.35M Generated for Our Clients
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Templates, 30 ad hooks, AI prompts, 6 trainings and a private community. Starts at $10/day in ad spend.
          </p>

          <div className="max-w-xl mx-auto mb-4">
            <button
              onClick={() => handleCTAClick('monthly', 'hero-cta')}
              id="hero-cta"
              className="cta-glow w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                {cta.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-slate-400 text-xs sm:text-sm mt-4">
              Instant access · Cancel anytime in one click
            </p>
          </div>
        </div>
      </div>

      {/* ==================== PROOF STACK ==================== */}
      <div data-track-section="proof" className="border-y border-slate-800 bg-slate-900/50 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { stat: '$3.35M', label: 'generated for our clients' },
            { stat: '500+', label: 'clients served in 12 years' },
            { stat: '$186K', label: 'from a single funnel' },
          ].map((p) => (
            <div key={p.stat} className="text-center bg-slate-800/40 border border-slate-700/50 rounded-xl py-5 px-4">
              <div className="text-3xl sm:text-4xl font-black text-emerald-300">{p.stat}</div>
              <div className="text-slate-400 text-sm mt-1">{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== PAIN AGITATION ==================== */}
      <div data-track-section="pain" className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-4">
            Sound Familiar?
          </h2>
          <p className="text-slate-400 text-center mb-12 text-lg">
            If you've tried running ads before, you've probably hit these walls:
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              "You boosted posts and watched the money disappear.",
              "You tried running campaigns, but they lost money.",
              "You're overwhelmed by targeting, bidding, and constant platform changes.",
              "You can't justify $2,000+/month agency fees.",
              "Your income swings because you rely on organic reach and referrals.",
            ].map((pain, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <span className="text-red-400 text-lg mt-0.5 flex-shrink-0">✕</span>
                <p className="text-slate-300 text-sm leading-relaxed">{pain}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl p-8 max-w-2xl">
              <p className="text-emerald-400 font-bold text-xl mb-3">
                It's not your fault. Nobody taught you the system.
              </p>
              <p className="text-slate-300 leading-relaxed">
                The difference between people who waste money on ads and people who make money with them? It's not talent. It's having the right system. That's what Freedom Club gives you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== INSIDE THE MEMBER AREA ==================== */}
      {/*
        No screenshots by design - members asked to see the actual value of
        each training instead of a dashboard mockup. This lists the real
        courses inside Freedom Club with what each one does for you.
      */}
      <div data-track-section="member_area" className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-5">
              <Lock className="w-3.5 h-3.5" />
              Your login works the second you join
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Here's What You Get When You Log In
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              No mystery and no waiting around. Every training below is open to you from day one.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-10">
            {[
              {
                icon: Target,
                title: 'Self-Liquidating Meta Ad Campaigns',
                copy: 'Build ad campaigns structured to pay for themselves on the front end, so your ad spend funds its own scale instead of draining your bank account.',
              },
              {
                icon: Sparkles,
                title: 'The AI Tools I Use For Paid Ads',
                copy: 'The exact AI tools used to make realistic, scroll-stopping ad creative, no camera crew, no designer, no waiting on an agency.',
              },
              {
                icon: Award,
                title: 'How To Close Deals From Paid Ads',
                copy: 'Turn a paid ad lead into a closed deal, the real process from first reply to signed client.',
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
            ].map((course) => (
              <div
                key={course.title}
                className="bg-slate-800/40 border border-slate-700/60 rounded-xl sm:rounded-2xl p-6 flex gap-4 items-start"
              >
                <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3">
                  <course.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1.5">{course.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{course.copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto bg-slate-800/60 border border-emerald-500/30 rounded-2xl p-6 mb-10 text-center">
            <p className="text-slate-400 text-sm mb-1">All 6 trainings above</p>
            <p className="text-emerald-300 font-black text-2xl mb-1">Open to you the second you join</p>
            <p className="text-slate-500 text-xs">Built by the team behind $3.35M generated for 500+ clients</p>
          </div>

          <div className="text-center">
            <button
              onClick={() => handleCTAClick('monthly', 'dashboard-cta')}
              id="dashboard-cta"
              className="cta-glow group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50 gap-3"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                {cta.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== HOW IT WORKS ==================== */}
      <div data-track-section="how_it_works" className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { n: '1', t: 'Join', d: "You're inside the member area in under 60 seconds." },
              { n: '2', t: 'Pick a template', d: 'Drop your offer into a proven campaign template and one of the 30 hooks.' },
              { n: '3', t: 'Launch at $10/day', d: 'Start small, keep what works, and scale the ads that pay for themselves.' },
            ].map((step) => (
              <div key={step.n} className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black flex items-center justify-center mb-4">{step.n}</div>
                <h3 className="text-white font-bold text-lg mb-1.5">{step.t}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== OBJECTIONS ==================== */}
      <div data-track-section="objections" className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-10">
            Built for Where You Are Right Now
          </h2>
          <div className="space-y-4">
            {[
              { q: "\u201cI've never run an ad.\u201d", a: 'Good. The training starts from zero and walks you through your first campaign.' },
              { q: "\u201cI don't have a big budget.\u201d", a: "You don't need one. The system is built to start at $10/day." },
              { q: "\u201cI don't have a website.\u201d", a: 'Send people to a booking link or your DMs. No site required.' },
              { q: "\u201cAn agency already burned me.\u201d", a: "That's why this teaches you the system yourself. No retainer, no contract." },
            ].map((o) => (
              <div key={o.q} className="flex gap-4 items-start bg-slate-800/40 border border-slate-700/60 rounded-xl p-5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold">{o.q}</p>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{o.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== SOCIAL PROOF / TESTIMONIALS ==================== */}
      <div data-track-section="reviews" className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What Our Members Are Saying
            </h2>
            <p className="text-slate-400 text-lg">
              Real results from real entrepreneurs
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 px-6">
              <Users className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span className="text-white font-bold text-sm sm:text-base">Join hundreds of entrepreneurs just like you</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 px-6">
              <Award className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span className="text-white font-bold text-sm sm:text-base">12 years in business</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 px-6">
              <DollarSign className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-white font-bold text-sm sm:text-base">$3.35M generated for 500+ clients</span>
            </div>
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
          <p className="text-slate-600 text-xs text-center mt-6 max-w-xl mx-auto">
            Results may vary. These reviews reflect individual experiences and are not a guarantee of income or ad performance.
          </p>
          <p className="text-emerald-300/80 text-sm text-center mt-4 font-semibold">
            Got a win from the training? Screenshot it and send it to support, yours could be the next one featured here.
          </p>
        </div>
      </div>

      {/* ==================== FAQ ==================== */}
      <div data-track-section="faq" className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">
            Common Questions
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/80 transition-colors"
                  id={`faq-${i}`}
                >
                  <span className="text-white font-semibold pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-slate-700/50">
                    <p className="text-slate-300 leading-relaxed pt-4 text-sm">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== FINAL CTA ==================== */}
      <div data-track-section="final_cta" className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-t border-slate-700/50 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Get Instant Access to
            <span className="block bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Freedom Club
            </span>
          </h2>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 mb-6 backdrop-blur-sm">
            <p className="text-amber-300 text-sm font-semibold mb-2">
              Access is only open for a limited time.
            </p>
            <p className="text-slate-400 text-sm mb-8">
              Instant access · Cancel anytime · $3.35M generated for our clients
            </p>

            <button
              onClick={() => handleCTAClick('monthly', 'final-cta')}
              id="final-cta"
              className="cta-glow w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl sm:text-2xl px-14 py-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50 gap-3"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                {cta.label}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <div className="flex items-center justify-center gap-6 mt-6 text-slate-400 text-xs flex-wrap">
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

          <p className="text-slate-500 text-sm">
            Once we close enrollment, this page comes down and you'll have to wait until we open it again.
          </p>
          <p className="text-slate-600 text-sm mt-3 italic">
            Or don't. Close the tab, keep running the same ads the same way, and see where that gets you.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 py-8 px-4 pb-28 sm:pb-8 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>&copy; 2026 Freedom Club. All rights reserved.</p>
        <p className="mt-2 text-slate-700">Results vary. This is an educational product, not a guarantee of income.</p>
        <p className="mt-1 text-slate-700">This site is not part of, and has not been reviewed, approved, or endorsed by Facebook/Meta or Google in any way.</p>
      </div>


      {showExit && (
        <ExitIntentPopup ctaLabel={cta.label} onCTA={handleExitCTA} onClose={() => setShowExit(false)} />
      )}
    </div>
  );
}

export default App;
