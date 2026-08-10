import { useState, useEffect } from 'react';
import {
  CheckCircle2, Users, Video, BookOpen, TrendingUp, DollarSign, Lock, ArrowRight, Zap, Award,
  Star, ChevronDown, ChevronUp, Shield, Target, Sparkles, ClipboardCheck, Phone,
  RefreshCw, FileText, Flame, X
} from 'lucide-react';

// Same GHL checkout used before; Yousif updated the underlying Stripe price
// to $4.75/month. No separate yearly plan exists.
const CHECKOUT_URL_MONTHLY = 'https://freedom.kenjiai.com/7-dollar-new-funnel-704974';
const CHECKOUT_URL_LIFETIME = 'https://freedom.kenjiai.com/7-dollar-new-funnel-704974';

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
  { id: 'A', label: 'Get Instant Access' },
  { id: 'B', label: 'Yes! I Want In!' },
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

const WHAT_YOU_GET = [
  {
    icon: Zap,
    title: '7-Day AI Ads Launch Map',
    desc: 'Step-by-step roadmap to launch your first campaign in a week.',
    value: 199,
  },
  {
    icon: FileText,
    title: 'Meta / Google / YouTube Campaign Templates',
    desc: 'Plug-and-play templates for each platform.',
    value: 297,
  },
  {
    icon: Sparkles,
    title: '30 Ad Hooks Swipe File',
    desc: 'Proven ad angles and hooks you can copy.',
    value: 97,
  },
  {
    icon: Sparkles,
    title: 'AI Prompt Pack',
    desc: 'Prompts for ad copy, targeting, and creative generation.',
    value: 67,
  },
  {
    icon: ClipboardCheck,
    title: 'Landing Page Checklist',
    desc: "Make sure your pages convert before running traffic.",
    value: 47,
  },
  {
    icon: Video,
    title: 'Live Monthly Ad Teardowns',
    desc: 'Real campaigns reviewed live every month.',
    value: 297,
  },
  {
    icon: TrendingUp,
    title: 'Monthly "What\'s Working Now" Briefing',
    desc: 'Updated strategies as platforms change.',
    value: 97,
  },
  {
    icon: Users,
    title: 'Private Community Access',
    desc: '334+ members helping each other win.',
    value: 197,
  },
  {
    icon: Phone,
    title: 'Optional 1:1 Campaign Map Call',
    desc: 'A free strategy call to help you apply the system. Optional, not required.',
    value: 297,
  },
];

const TOTAL_VALUE = WHAT_YOU_GET.reduce((sum, item) => sum + item.value, 0);

const FAQS = [
  {
    q: 'How much does this cost?',
    a: "It's a small monthly membership, billed monthly with no contracts. You'll see the exact price before you confirm at checkout. Cancel anytime, no hidden fees.",
  },
  {
    q: 'Is there a one-time payment option?',
    a: 'Yes. Email support@kenjiai.com and ask about lifetime access for a single $27.79 payment, no recurring billing at all.',
  },
  {
    q: 'What happens after I buy?',
    a: "You get instant access to the full training, templates, prompt pack, and community. You'll be inside the member area in under 60 seconds.",
  },
  {
    q: 'Do I need a website?',
    a: 'No. The system includes a landing page checklist and templates. You can use any page builder.',
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
    q: 'How do refunds work?',
    a: "Email support@kenjiai.com within 30 days of joining and we'll refund your payment in full. No questions asked.",
  },
  {
    q: "What if I'm a complete beginner?",
    a: 'The 7-day launch map starts from zero. No prior ad experience needed.',
  },
  {
    q: 'What platforms does this cover?',
    a: 'Facebook/Meta, Google, and YouTube.',
  },
  {
    q: 'Do I need to use AI tools?',
    a: 'The system includes an AI prompt pack, but AI tools are optional. The templates and strategies work with or without AI.',
  },
];

/**
 * Evergreen urgency bar. "Back to business before Q4" energy, no
 * trademarked events/brands. Rolling 48h countdown per visitor so urgency
 * never expires to 00:00:00. CTA scrolls to the final CTA section.
 */
const URGENCY_WINDOW_MS = 48 * 60 * 60 * 1000;
const URGENCY_STORAGE_KEY = 'kenji_ace_urgency_deadline';

function UrgencyBar() {
  const [remaining, setRemaining] = useState(URGENCY_WINDOW_MS);

  useEffect(() => {
    let deadline = 0;
    try {
      deadline = Number(localStorage.getItem(URGENCY_STORAGE_KEY));
    } catch {
      /* localStorage blocked (private mode) — countdown still runs, just resets on reload */
    }
    if (!deadline || Number.isNaN(deadline) || deadline < Date.now()) {
      deadline = Date.now() + URGENCY_WINDOW_MS;
      try {
        localStorage.setItem(URGENCY_STORAGE_KEY, String(deadline));
      } catch {
        /* ignore persistence failure */
      }
    }
    const tick = () => setRemaining(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const total = Math.floor(remaining / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');

  const scrollToCTA = () =>
    document.getElementById('final-cta')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 28px, transparent 28px 56px)' }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:flex-row sm:gap-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
          <Flame className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Everyone's rebuilding their client pipeline before Q4 hits —{' '}
          <span className="font-extrabold">don't start the season behind.</span>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="hidden text-[10px] font-bold uppercase tracking-wider opacity-80 sm:inline">Closes in</span>
            <div className="flex items-center gap-1 rounded-lg bg-black/25 px-2 py-1 font-mono text-sm font-bold tabular-nums">
              <span>{h}</span><span className="opacity-60">:</span><span>{m}</span><span className="opacity-60">:</span><span>{s}</span>
            </div>
          </div>
          <button
            onClick={scrollToCTA}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-700 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Get started →
          </button>
        </div>
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
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/30 rounded-2xl p-8 shadow-2xl"
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
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold mb-5">
            <Shield className="w-3.5 h-3.5" />
            Before you close this tab
          </div>

          <h3 id="exit-popup-heading" className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
            Wait. Before you go.
          </h3>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            This isn't a knockoff freebie you'll forget about. It's a very low monthly investment, low enough to say yes today, real enough that you'll actually show up and use it. 334+ members already are.
          </p>

          <button
            onClick={onCTA}
            className="w-full group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-base sm:text-lg px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center border border-amber-400/50 gap-2 mb-4"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-4 text-slate-500 text-xs mb-4 flex-wrap">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />30-day guarantee</span>
            <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />Cancel anytime</span>
          </div>

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

function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      /* sessionStorage blocked (private mode) — allow it once per mount instead */
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
    monthly: { name: 'AI Client Acquisition Engine - Monthly Membership', contentId: 'ace-4-75-monthly', value: 4.75, url: CHECKOUT_URL_MONTHLY },
    lifetime: { name: 'AI Client Acquisition Engine - Lifetime Access', contentId: 'ace-27-79-lifetime', value: 27.79, url: CHECKOUT_URL_LIFETIME },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <UrgencyBar />
      {/* Trust Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800 text-white py-3 px-4 text-center sticky top-0 z-40 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            30-Day Money-Back Guarantee
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <RefreshCw className="w-4 h-4 text-sky-400" />
            Cancel Anytime
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            Instant Access
          </span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Users className="w-4 h-4 text-blue-400" />
            334+ Members
          </span>
        </div>
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>For anyone who wants to make money running ads</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight px-1 sm:px-0">
            Make Money Running Ads
            <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              in 7 Days
            </span>
            <span className="block text-xl sm:text-4xl md:text-5xl mt-2 text-slate-300 font-bold">
              Even If Every Campaign You've Tried Has Flopped
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Get the complete AI Client Acquisition Engine: templates, prompts, ad hooks, live support, and a private community. Cancel anytime.
          </p>

          <div className="mb-6 sm:mb-10 relative px-0 sm:px-4">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none rounded-xl sm:rounded-2xl"></div>
            <picture>
              <source
                type="image/webp"
                srcSet="/freedom-club-bundle-800w.webp 800w, /freedom-club-bundle-1200w.webp 1024w"
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 42rem, 48rem"
              />
              <img
                src="/freedom-club-bundle.jpg"
                alt="AI Client Acquisition Engine membership: templates, prompts, ad hooks, live monthly teardowns, and private community"
                width={1024}
                height={1024}
                fetchPriority="high"
                decoding="async"
                className="w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl mx-auto rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-500/10 object-contain"
              />
            </picture>
          </div>

          <div className="max-w-xl mx-auto mb-4">
            <button
              onClick={() => handleCTAClick('monthly')}
              id="hero-cta"
              className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-amber-400/50"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                {cta.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-slate-500 text-xs mt-4">
              Cancel anytime · Instant access · 30-day refund
            </p>
          </div>
        </div>
      </div>

      {/* Live Social Proof Ticker */}
      <div className="w-full overflow-hidden py-3 bg-slate-900/50 border-y border-slate-800">
        <div className="flex gap-12 whitespace-nowrap animate-[scroll_20s_linear_infinite] items-center h-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center">
              <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Mark T. just joined the membership</span>
              <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sarah K. launched 3 campaigns in 48 hours</span>
              <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Jessica M. booked 5 sales calls from one campaign</span>
              <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> David R. added 15 qualified leads using the AI templates</span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>

      {/* ==================== PAIN AGITATION ==================== */}
      <div className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
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
                The difference between people who waste money on ads and people who make money with them? It's not talent. It's having the right system. That's what the AI Client Acquisition Engine gives you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== WHAT YOU GET ==================== */}
      <div className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Here's What You Get
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              The AI Client Acquisition Engine Membership includes:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {WHAT_YOU_GET.map((item, i) => (
              <div
                key={i}
                className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-500"
              >
                <span className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  ${item.value} value
                </span>
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 leading-tight pr-16">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto mb-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 text-center">
            <p className="text-slate-400 text-sm mb-1">Total value if you bought this piece by piece:</p>
            <p className="text-slate-500 text-2xl font-bold line-through mb-1">${TOTAL_VALUE.toLocaleString()}+</p>
            <p className="text-white text-lg font-black">Yours for one low monthly payment</p>
          </div>

          <div className="text-center">
            <button
              onClick={() => handleCTAClick('monthly')}
              id="mid-cta"
              className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-amber-400/50 gap-3"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                {cta.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-slate-500 text-xs mt-3">
              You'll be inside the member area in under 60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* ==================== GUARANTEE ==================== */}
      <div className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            30-Day Money-Back Guarantee
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl mx-auto">
            Go through the 7-day launch map, use the templates, join a live session. If you don't feel clear on how to launch your first profitable campaign within 30 days, email support@kenjiai.com for a full refund. No questions asked.
          </p>
        </div>
      </div>

      {/* ==================== SOCIAL PROOF / TESTIMONIALS ==================== */}
      <div className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              What Our Members Are Saying
            </h2>
            <p className="text-slate-400 text-lg">
              Real results from real entrepreneurs
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            {[
              { value: '12', label: 'Years in Business', icon: Award },
              { value: '334+', label: 'Members', icon: Users },
              { value: 'Monthly', label: 'Live Ad Teardowns', icon: Video },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-slate-800/50 border border-slate-700/50 rounded-xl py-5 px-3">
                <stat.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-slate-400 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Marcus T.',
                role: 'E-commerce Owner',
                text: "I was burning $200/day on Facebook ads with nothing to show for it. After going through the training, I rebuilt my campaigns using their framework. Within 3 weeks I was getting a 4.2x return on ad spend.",
                stars: 5,
              },
              {
                name: 'Sarah K.',
                role: 'Business Coach',
                text: 'I was scared to touch paid ads. The step-by-step approach made it so simple. I launched my first Google Ads campaign following the exact templates and got 23 qualified leads in my first week.',
                stars: 5,
              },
              {
                name: 'David R.',
                role: 'Agency Owner',
                text: "I've been doing ads for years but was stuck at a plateau. The scaling strategies and the community feedback on my campaigns helped me identify blind spots. My agency added $8K/month in recurring revenue in 60 days.",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-slate-400 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs text-center mt-6 max-w-xl mx-auto">
            Results may vary. These testimonials reflect individual experiences and are not a guarantee of income or ad performance.
          </p>
        </div>
      </div>

      {/* ==================== FAQ ==================== */}
      <div className="py-16 sm:py-20 px-4">
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
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-t border-slate-700/50 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Get Instant Access to the
            <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              AI Client Acquisition Engine
            </span>
          </h2>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 mb-6 backdrop-blur-sm">
            <p className="text-slate-400 text-sm mb-8">
              Billed monthly · Cancel anytime · 30-day refund
            </p>

            <button
              onClick={() => handleCTAClick('monthly')}
              id="final-cta"
              className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xl sm:text-2xl px-14 py-6 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-amber-400/50 gap-3"
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
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                30-Day Guarantee
              </span>
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            We reserve the right to close enrollment at any time to keep the community quality high.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 py-8 px-4 pb-28 sm:pb-8 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>&copy; 2026 AI Client Acquisition Engine. All rights reserved.</p>
        <p className="mt-2 text-slate-700">Results vary. This is an educational product, not a guarantee of income.</p>
      </div>

      {/* Sticky Mobile Bottom CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-amber-500/30 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => handleCTAClick('monthly')}
          id="sticky-mobile-cta"
          className="w-full group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-base px-5 py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/50 inline-flex items-center justify-center gap-2"
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
