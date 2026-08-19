import { useState, useEffect } from 'react';
import {
  CheckCircle2, Users, BookOpen, DollarSign, Lock, ArrowRight, Zap, Award,
  Star, ChevronDown, ChevronUp, Shield, Target, Sparkles, Phone,
  RefreshCw, FileText, Clock, X
} from 'lucide-react';

// Same GHL checkout used before. The Stripe price on the GHL side has moved
// more than once independent of this codebase ($4.75 -> $6.75 -> $7, as of
// 2026-08-11) - there's no live API reading the real price, so PLAN_DETAILS
// below has to be updated by hand whenever it changes on the GHL side, or
// the pixel value silently drifts from what's actually charged. No separate
// yearly plan exists.
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
  { id: 'A', label: 'Sign Up & Get Started' },
  { id: 'B', label: 'Yes, Get Me Started!' },
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
    icon: FileText,
    title: 'Meta Campaign Templates',
    desc: 'Plug-and-play ad templates you can copy and use right away.',
  },
  {
    icon: Sparkles,
    title: '30 Ad Hooks Swipe File',
    desc: 'Proven ad angles and hooks you can copy.',
  },
  {
    icon: Sparkles,
    title: 'AI Prompt Pack',
    desc: 'Prompts for ad copy, targeting, and creative generation.',
  },
  {
    icon: Users,
    title: 'Private Community Access',
    desc: 'Hundreds of entrepreneurs just like you, helping each other win.',
  },
  {
    icon: Phone,
    title: 'Optional 1:1 Campaign Map Call',
    desc: 'A free strategy call to help you apply the system. Optional, not required.',
  },
];

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
            className="w-full group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-base sm:text-lg px-8 py-4 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(20,184,166,0.6)] transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50 gap-2 mb-4"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-4 text-slate-500 text-xs mb-4 flex-wrap">
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
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <RefreshCw className="w-4 h-4 text-sky-400" />
            Cancel Anytime
          </span>
        </div>
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Freedom Club · beginners welcome</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight px-1 sm:px-0">
            Learn How to Run Ads
            <span className="block bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              That Actually Make Money
            </span>
            <span className="block text-xl sm:text-4xl md:text-5xl mt-2 text-slate-300 font-bold">
              Even If You've Never Run a Single Ad Before
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            If you want to make money online, this is where you start. Templates, prompts, ad hooks, live support, and a private community. Cancel anytime.
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
                alt="Freedom Club membership: ad templates, prompts, ad hooks, and private community"
                width={1024}
                height={1024}
                fetchPriority="high"
                decoding="async"
                className="w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl mx-auto rounded-xl sm:rounded-2xl shadow-2xl shadow-cyan-500/10 object-contain"
              />
            </picture>
          </div>

          <div className="max-w-xl mx-auto mb-4">
            <button
              onClick={() => handleCTAClick('monthly')}
              id="hero-cta"
              className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                {cta.label}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-slate-500 text-xs mt-4">
              Cancel anytime · Instant access
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
                The difference between people who waste money on ads and people who make money with them? It's not talent. It's having the right system. That's what Freedom Club gives you.
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
              Everything Inside Your Membership
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              The full Freedom Club system, built to a standard most agencies don't bother with.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {WHAT_YOU_GET.map((item, i) => (
              <div
                key={i}
                className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-500"
              >
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 leading-tight">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => handleCTAClick('monthly')}
              id="mid-cta"
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50 gap-3"
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 px-6">
              <Users className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span className="text-white font-bold text-sm sm:text-base">Join hundreds of entrepreneurs just like you</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl py-4 px-6">
              <Award className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <span className="text-white font-bold text-sm sm:text-base">12 years in business</span>
            </div>
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
                text: 'I was scared to touch paid ads. The step-by-step approach made it so simple. I launched my first Meta ads campaign following the exact templates and got 23 qualified leads in my first week.',
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
                    <Star key={j} className="w-4 h-4 text-cyan-300 fill-cyan-300" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
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
              Billed monthly · Cancel anytime
            </p>

            <button
              onClick={() => handleCTAClick('monthly')}
              id="final-cta"
              className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl sm:text-2xl px-14 py-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50 gap-3"
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
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 py-8 px-4 pb-28 sm:pb-8 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>&copy; 2026 Freedom Club. All rights reserved.</p>
        <p className="mt-2 text-slate-700">Results vary. This is an educational product, not a guarantee of income.</p>
      </div>

      {/* Sticky Mobile Bottom CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-emerald-500/30 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => handleCTAClick('monthly')}
          id="sticky-mobile-cta"
          className="w-full group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-base px-5 py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/50 inline-flex items-center justify-center gap-2"
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
