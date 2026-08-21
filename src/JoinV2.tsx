import { useState, useEffect } from 'react';
import {
  Users, BookOpen, ArrowRight, Zap, Award, Star, ChevronDown, ChevronUp,
  Shield, Target, Sparkles, Phone, FileText, Clock, Lock, Check
} from 'lucide-react';

/**
 * A/B variant of the live Freedom Club page (src/App.tsx), served at /join-v2.
 *
 * The one structural difference is the order flow. The live page sends every
 * click straight to the GHL checkout. This variant runs the same explicit
 * two-step order form the live GHL funnel pages already use
 * (freedom.kenjiai.com/startnow): "Step #1" collects name, email and phone
 * with no payment fields anywhere on screen, and "Step #2 Access" is the
 * payment step. Getting the signup commitment first is the whole point of
 * the test, so do not collapse it back into one step.
 *
 * Offer copy and branding are a snapshot of App.tsx on purpose. App.tsx is
 * the control and stays untouched. If the offer copy changes there, mirror it
 * here by hand so the only variable under test is the order flow.
 */

const CHECKOUT_URL = 'https://freedom.kenjiai.com/startnow';

/**
 * The GHL order form on freedom.kenjiai.com/startnow prefills its own name,
 * email and phone inputs from these query params (verified live on
 * 2026-08-20), so nobody has to type their details twice after step 1.
 */
const PREFILL_PARAMS = { name: 'full_name', email: 'email', phone: 'phone' };

const MEMBERSHIP = {
  name: 'Freedom Club Membership',
  contentId: 'ace-monthly',
  price: 7,
  billing: 'per month',
};

/**
 * Upsell offered after the signup and payment steps.
 *
 * Name and price are copied verbatim from the live product record, not typed
 * from memory. Verified 2026-08-20 in two places that agree:
 *   - Stripe live mode, acct_18xAQ5AFtO7OZUie, product prod_UnV6vUhQRqEozy
 *   - GHL location q5L4ttbBMHNxieXIcTVJ, product 6a43524b9e92122dc69b2008,
 *     price 6a43524b9e92127d4f9b200d, $179 USD, one time
 * If the price moves in GHL it will silently drift from this page. Re-check it
 * before any new ad spend points here.
 */
const PLACEMENT_OFFER = {
  productId: '6a43524b9e92122dc69b2008',
  name: 'Close 4 Survival LIVE Sales Training OR Sale Reps Placement Mon-Friday 11AM',
  price: 179,
  billing: 'one time',
  addOnParam: 'sale-reps-placement',
  bullets: [
    'Live sales training every weekday at 11AM',
    'Or get placed with a sales team instead of building one from scratch',
    'Run by the same people who train our own closers',
  ],
};

/**
 * Second upsell slot, deliberately empty.
 *
 * Yousif asked for a "1:1 system audit" offer here. It does not exist yet. A
 * full pass of the live Stripe account (every active product, plus a name
 * search for audit, review, assessment and diagnostic) and all 137 GHL
 * products in the KenjiAI location returned nothing matching. Rather than
 * invent a product and a price, this stays null and nothing renders. Fill it
 * in only once the real product is created, and copy the name and price from
 * the product record the same way PLACEMENT_OFFER does.
 */
const SECOND_OFFER: typeof PLACEMENT_OFFER | null = null;

type TrackingWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
};

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
    icon: BookOpen,
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
    q: 'Why do you ask for my details before payment?',
    a: 'So your account and your community login are ready the second your payment goes through. Step 1 does not charge you anything.',
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
];

function UrgencyBar() {
  const scrollToForm = () =>
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });

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
          onClick={scrollToForm}
          className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-violet-700 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          Sign up →
        </button>
      </div>
    </div>
  );
}

type Step = 1 | 2 | 3;

type Details = { name: string; email: string; phone: string };

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, '').length >= 10;
}

/**
 * Two-step order form, modelled on the live GHL order form at
 * freedom.kenjiai.com/startnow: the same "Step #1" and "Step #2 Access" tab
 * header, the same three fields in the same order, and the same button copy.
 *
 * Card details are never collected here. Step 2 hands off to the encrypted
 * GHL checkout with the step 1 details prefilled, which is where the card is
 * entered and the $7 subscription is actually charged.
 */
function OrderForm({
  step,
  setStep,
  details,
  setDetails,
  addOn,
  setAddOn,
}: {
  step: Step;
  setStep: (s: Step) => void;
  details: Details;
  setDetails: (d: Details) => void;
  addOn: boolean;
  setAddOn: (v: boolean) => void;
}) {
  const [errors, setErrors] = useState<Partial<Details>>({});

  const submitStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Details> = {};
    if (!details.name.trim()) next.name = 'Please add your name';
    if (!isValidEmail(details.email)) next.email = 'Please add a valid email address';
    if (!isValidPhone(details.phone)) next.phone = 'Please add a valid phone number';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const w = window as TrackingWindow;
    w.fbq?.('track', 'Lead', { content_name: MEMBERSHIP.name, variant: 'v2' });
    w.dataLayer?.push({ event: 'signup_step_complete', variant: 'v2' });
    setStep(2);
  };

  const goToPayment = () => {
    const total = MEMBERSHIP.price + (addOn ? PLACEMENT_OFFER.price : 0);
    const w = window as TrackingWindow;
    w.fbq?.('track', 'InitiateCheckout', {
      content_name: MEMBERSHIP.name,
      content_ids: [MEMBERSHIP.contentId],
      content_type: 'product',
      value: total,
      currency: 'USD',
      num_items: addOn ? 2 : 1,
      variant: 'v2',
    });
    w.dataLayer?.push({ event: 'initiate_checkout', variant: 'v2', add_on: addOn });

    const url = new URL(CHECKOUT_URL);
    url.searchParams.set(PREFILL_PARAMS.name, details.name.trim());
    url.searchParams.set(PREFILL_PARAMS.email, details.email.trim());
    url.searchParams.set(PREFILL_PARAMS.phone, details.phone.trim());
    url.searchParams.set('variant', 'v2');
    if (addOn) url.searchParams.set('add_on', PLACEMENT_OFFER.addOnParam);
    window.location.href = url.toString();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30';

  return (
    <div id="order-form" className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl">
      {/* Step tabs, same two labels the live GHL order form uses */}
      <div className="grid grid-cols-2 border-b-4 border-sky-700 bg-white">
        {([1, 2] as const).map((n) => {
          const active = step === n || (step === 3 && n === 2);
          return (
            <div
              key={n}
              className={`relative py-3 text-center text-sm font-bold ${active ? 'text-sky-700' : 'text-slate-400'}`}
            >
              {n === 1 ? 'Step #1' : 'Step #2 Access'}
              {active && (
                <span className="absolute -bottom-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-8 border-b-8 border-x-transparent border-b-sky-700" />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <form onSubmit={submitStepOne} className="space-y-3 p-5 sm:p-6" noValidate>
          <div>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Full Name..."
              aria-label="Full Name"
              className={inputClass}
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email Address..."
              aria-label="Email Address"
              className={inputClass}
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="Phone Number..."
              aria-label="Phone Number"
              className={inputClass}
              value={details.phone}
              onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            id="step-1-submit"
            className="w-full rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-black text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
          >
            YES! Give ME Private Access Now
          </button>
          <p className="text-center text-[11px] text-slate-400">
            We Respect Your Privacy &amp; Information.
          </p>
          <p className="text-center text-xs font-semibold text-slate-500">
            No card needed on this step.
          </p>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4 p-5 sm:p-6">
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="font-bold">You're signed up, {details.name.trim().split(' ')[0]}.</span>{' '}
            Last step is payment.
          </div>

          <div className="rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">{MEMBERSHIP.name}</span>
              <span className="text-sm font-bold text-slate-900">
                ${MEMBERSHIP.price}.00 {MEMBERSHIP.billing}
              </span>
            </div>

            {/* Order bump. Real product, real price, both verified in Stripe and GHL. */}
            <label className="flex cursor-pointer items-start gap-3 border-b border-dashed border-amber-400 bg-amber-50 px-4 py-3">
              <input
                type="checkbox"
                id="order-bump"
                className="mt-1 h-4 w-4 accent-emerald-600"
                checked={addOn}
                onChange={(e) => setAddOn(e.target.checked)}
              />
              <span className="text-xs leading-relaxed text-slate-700">
                <span className="font-bold text-slate-900">
                  Add {PLACEMENT_OFFER.name} for ${PLACEMENT_OFFER.price} {PLACEMENT_OFFER.billing}.
                </span>{' '}
                Daily live sales training, or placement with a sales team instead of hiring one yourself.
              </span>
            </label>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-bold text-slate-900">Due today</span>
              <span className="text-lg font-black text-slate-900">
                ${MEMBERSHIP.price + (addOn ? PLACEMENT_OFFER.price : 0)}.00
              </span>
            </div>
          </div>

          <button
            onClick={goToPayment}
            id="step-2-pay"
            className="w-full rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-black text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
          >
            Pay ${MEMBERSHIP.price + (addOn ? PLACEMENT_OFFER.price : 0)} and Get Instant Access
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            Card details are entered on our encrypted checkout. Billed monthly, cancel anytime.
          </p>

          <button
            onClick={() => setStep(1)}
            className="w-full text-center text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600"
          >
            Back to step 1
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-center text-sm font-bold text-emerald-700">
            Your membership is active. One thing before you go in.
          </p>
          <UpsellCard offer={PLACEMENT_OFFER} details={details} />
          {SECOND_OFFER && <UpsellCard offer={SECOND_OFFER} details={details} />}
          <a
            href="https://learn.kenjiai.com/"
            className="block text-center text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600"
          >
            No thanks, take me to the member area
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Upsell card. Everything shown here comes off the offer record, so a product
 * that does not exist cannot end up on the page.
 */
function UpsellCard({ offer, details }: { offer: typeof PLACEMENT_OFFER; details: Details }) {
  const claim = () => {
    const w = window as TrackingWindow;
    w.fbq?.('track', 'InitiateCheckout', {
      content_name: offer.name,
      content_ids: [offer.productId],
      content_type: 'product',
      value: offer.price,
      currency: 'USD',
      variant: 'v2-upsell',
    });
    w.dataLayer?.push({ event: 'upsell_click', product_id: offer.productId, variant: 'v2' });

    const url = new URL(CHECKOUT_URL);
    if (details.name.trim()) url.searchParams.set(PREFILL_PARAMS.name, details.name.trim());
    if (details.email.trim()) url.searchParams.set(PREFILL_PARAMS.email, details.email.trim());
    if (details.phone.trim()) url.searchParams.set(PREFILL_PARAMS.phone, details.phone.trim());
    url.searchParams.set('add_on', offer.addOnParam);
    url.searchParams.set('variant', 'v2');
    window.location.href = url.toString();
  };

  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5">
      <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-amber-700">
        Member add-on
      </p>
      <h3 className="mb-2 text-base font-black leading-snug text-slate-900">{offer.name}</h3>
      <p className="mb-3 text-2xl font-black text-slate-900">
        ${offer.price}
        <span className="ml-1 text-sm font-semibold text-slate-500">{offer.billing}</span>
      </p>
      <ul className="mb-4 space-y-1.5">
        {offer.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
            {b}
          </li>
        ))}
      </ul>
      <button
        onClick={claim}
        id="upsell-cta"
        className="w-full rounded-lg bg-slate-900 px-6 py-3.5 text-base font-black text-white transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
      >
        Yes, add this to my order
      </button>
    </div>
  );
}

function JoinV2() {
  const [step, setStep] = useState<Step>(1);
  const [details, setDetails] = useState<Details>({ name: '', email: '', phone: '' });
  const [addOn, setAddOn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /**
   * The membership is charged on the GHL checkout, on another domain, so the
   * only honest way to show a post-purchase upsell is to be sent back here
   * after payment. Point the GHL thank-you redirect at /join-v2?step=3 and
   * step 3 becomes the upsell page for people who already paid.
   */
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('step');
    if (requested === '3') setStep(3);
    const w = window as TrackingWindow;
    w.dataLayer?.push({ event: 'page_variant', variant: 'v2' });
  }, []);

  const scrollToForm = () =>
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <UrgencyBar />

      <div className="sticky top-0 z-40 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 text-center text-white backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Premium Membership
          </span>
          <span className="hidden text-slate-600 sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Zap className="h-4 w-4 text-cyan-400" />
            Instant Access
          </span>
          <span className="hidden text-slate-600 sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Users className="h-4 w-4 text-blue-400" />
            Hundreds of Entrepreneurs
          </span>
        </div>
      </div>

      {/* ==================== HERO + ORDER FORM ==================== */}
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-14 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 sm:mb-8 sm:px-5 sm:text-sm">
            <Target className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
            <span>Freedom Club · beginners welcome</span>
          </div>

          <h1 className="mb-4 px-1 text-3xl font-black leading-[1.1] tracking-tight text-white sm:mb-6 sm:px-0 sm:text-5xl md:text-6xl">
            Learn How to Run Ads
            <span className="block bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              That Actually Make Money
            </span>
            <span className="mt-2 block text-xl font-bold text-slate-300 sm:text-4xl md:text-5xl">
              Even If You've Never Run a Single Ad Before
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl px-2 text-base leading-relaxed text-slate-400 sm:mb-10 sm:px-0 sm:text-xl">
            If you want to make money online, this is where you start. Templates, prompts, ad hooks, live support, and a private community.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-gradient-to-t from-slate-950 via-transparent to-transparent sm:rounded-2xl" />
            <picture>
              <source
                type="image/webp"
                srcSet="/freedom-club-bundle-800w.webp 800w, /freedom-club-bundle-1200w.webp 1024w"
                sizes="(max-width: 1024px) 90vw, 32rem"
              />
              <img
                src="/freedom-club-bundle.jpg"
                alt="Freedom Club membership: ad templates, prompts, ad hooks, and private community"
                width={1024}
                height={1024}
                fetchPriority="high"
                decoding="async"
                className="mx-auto w-full max-w-[90vw] rounded-xl object-contain shadow-2xl shadow-cyan-500/10 sm:max-w-lg sm:rounded-2xl"
              />
            </picture>
          </div>

          <div className="order-1 lg:order-2">
            <p className="mb-3 text-center text-sm font-bold text-white">
              Two steps. Sign up first, pay second.
            </p>
            <OrderForm
              step={step}
              setStep={setStep}
              details={details}
              setDetails={setDetails}
              addOn={addOn}
              setAddOn={setAddOn}
            />
          </div>
        </div>
      </div>

      {/* Social proof ticker */}
      <div className="w-full overflow-hidden border-y border-slate-800 bg-slate-900/50 py-3">
        <div className="flex h-8 animate-[scroll_20s_linear_infinite] items-center gap-12 whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Mark T. just joined the membership</span>
              <span className="flex items-center gap-2 text-sm font-medium text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Sarah K. launched 3 campaigns in 48 hours</span>
              <span className="flex items-center gap-2 text-sm font-medium text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Jessica M. booked 5 sales calls from one campaign</span>
              <span className="flex items-center gap-2 text-sm font-medium text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> David R. added 15 qualified leads using the AI templates</span>
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

      {/* ==================== PAIN ==================== */}
      <div className="border-y border-slate-800/50 bg-slate-900/50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-black text-white sm:text-4xl">
            Sound Familiar?
          </h2>
          <p className="mb-12 text-center text-lg text-slate-400">
            If you've tried running ads before, you've probably hit these walls:
          </p>

          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            {[
              'You boosted posts and watched the money disappear.',
              'You tried running campaigns, but they lost money.',
              'You\'re overwhelmed by targeting, bidding, and constant platform changes.',
              'You can\'t justify $2,000+/month agency fees.',
              'Your income swings because you rely on organic reach and referrals.',
            ].map((pain) => (
              <div key={pain} className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-5">
                <span className="mt-0.5 flex-shrink-0 text-lg text-red-400">✕</span>
                <p className="text-sm leading-relaxed text-slate-300">{pain}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block max-w-2xl rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-green-500/10 p-8">
              <p className="mb-3 text-xl font-bold text-emerald-400">
                It's not your fault. Nobody taught you the system.
              </p>
              <p className="leading-relaxed text-slate-300">
                The difference between people who waste money on ads and people who make money with them? It's not talent. It's having the right system. That's what Freedom Club gives you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== WHAT YOU GET ==================== */}
      <div className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              Everything Inside Your Membership
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-400">
              The full Freedom Club system, built to a standard most agencies don't bother with.
            </p>
          </div>

          <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_YOU_GET.map((item) => (
              <div
                key={item.title}
                className="relative rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/50"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-bold leading-tight text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={scrollToForm}
              id="mid-cta"
              className="cta-glow group inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500 to-teal-600 px-12 py-5 text-lg font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] sm:text-xl"
            >
              Start With Step 1
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-xs text-slate-500">
              You'll be inside the member area in under 60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* ==================== MEMBER AREA ==================== */}
      <div className="border-y border-slate-800/50 bg-slate-900/50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 sm:text-sm">
              <Lock className="h-3.5 w-3.5" />
              Your login works the second you join
            </div>
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              Here's What You See When You Log In
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-400">
              No mystery and no waiting around. This is the real member area, and every training in it is open to you from day one.
            </p>
          </div>

          <figure className="relative mb-10">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-cyan-500/10 blur-2xl" />
            <picture>
              <source type="image/webp" srcSet="/dashboard-library.webp" />
              <img
                src="/dashboard-library.jpg"
                alt="The Freedom Club member area training library, showing courses on chargebacks, AI tools, business funding, closing deals, client attraction, and paid ads certification"
                width={1400}
                height={756}
                loading="lazy"
                decoding="async"
                className="relative w-full rounded-xl border border-slate-700/60 shadow-2xl shadow-cyan-500/10 sm:rounded-2xl"
              />
            </picture>
            <figcaption className="relative mt-4 text-center text-sm text-slate-400">
              The training library, ready to watch the minute you log in.
            </figcaption>
          </figure>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            <figure>
              <picture>
                <source type="image/webp" srcSet="/dashboard-community.webp" />
                <img
                  src="/dashboard-community.jpg"
                  alt="The Freedom Club community feed, where members post questions and share what is working"
                  width={900}
                  height={1012}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-xl border border-slate-700/60 shadow-xl shadow-cyan-500/5"
                />
              </picture>
              <figcaption className="mt-3 text-center text-sm text-slate-400">
                The community feed, where members ask questions and get answers.
              </figcaption>
            </figure>

            <figure>
              <picture>
                <source type="image/webp" srcSet="/dashboard-courses.webp" />
                <img
                  src="/dashboard-courses.jpg"
                  alt="Freedom Club courses including Pre-Launch Pre-Converted and a guide to self-liquidating Meta ad campaigns"
                  width={900}
                  height={669}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-xl border border-slate-700/60 shadow-xl shadow-cyan-500/5"
                />
              </picture>
              <figcaption className="mt-3 text-center text-sm text-slate-400">
                Open any course and start on day one.
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* ==================== TESTIMONIALS ==================== */}
      <div className="border-y border-slate-800/50 bg-slate-900/50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-black text-white sm:text-4xl">
              What Our Members Are Saying
            </h2>
            <p className="text-lg text-slate-400">Real results from real entrepreneurs</p>
          </div>

          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-6 py-4">
              <Users className="h-5 w-5 flex-shrink-0 text-sky-400" />
              <span className="text-sm font-bold text-white sm:text-base">Join hundreds of entrepreneurs just like you</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-6 py-4">
              <Award className="h-5 w-5 flex-shrink-0 text-sky-400" />
              <span className="text-sm font-bold text-white sm:text-base">12 years in business</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Marcus T.',
                role: 'E-commerce Owner',
                text: "I was burning $200/day on Facebook ads with nothing to show for it. After going through the training, I rebuilt my campaigns using their framework. Within 3 weeks I was getting a 4.2x return on ad spend.",
              },
              {
                name: 'Sarah K.',
                role: 'Business Coach',
                text: 'I was scared to touch paid ads. The step-by-step approach made it so simple. I launched my first Meta ads campaign following the exact templates and got 23 qualified leads in my first week.',
              },
              {
                name: 'David R.',
                role: 'Agency Owner',
                text: "I've been doing ads for years but was stuck at a plateau. The scaling strategies and the community feedback on my campaigns helped me identify blind spots. My agency added $8K/month in recurring revenue in 60 days.",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-cyan-300 text-cyan-300" />
                  ))}
                </div>
                <p className="mb-6 text-sm italic leading-relaxed text-slate-300">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-xl text-center text-xs text-slate-600">
            Results may vary. These testimonials reflect individual experiences and are not a guarantee of income or ad performance.
          </p>
        </div>
      </div>

      {/* ==================== FAQ ==================== */}
      <div className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-black text-white sm:text-4xl">
            Common Questions
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-800/80"
                >
                  <span className="pr-4 font-semibold text-white">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="border-t border-slate-700/50 px-5 pb-5">
                    <p className="pt-4 text-sm leading-relaxed text-slate-300">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== FINAL CTA ==================== */}
      <div className="relative overflow-hidden border-t border-slate-700/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 px-4 py-20">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            Get Instant Access to
            <span className="block bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Freedom Club
            </span>
          </h2>

          <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-8 backdrop-blur-sm">
            <p className="mb-2 text-sm font-semibold text-amber-300">
              Access is only open for a limited time.
            </p>
            <p className="mb-8 text-sm text-slate-400">Billed monthly · Cancel anytime</p>

            <button
              onClick={scrollToForm}
              id="final-cta"
              className="cta-glow group inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500 to-teal-600 px-14 py-6 text-xl font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] sm:w-auto sm:text-2xl"
            >
              Take Step 1 Now
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Instant Access
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Once we close enrollment, this page comes down and you'll have to wait until we open it again.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800/50 bg-slate-950 px-4 py-8 pb-28 text-center text-sm text-slate-600 sm:pb-8">
        <p>&copy; 2026 Freedom Club. All rights reserved.</p>
        <p className="mt-2 text-slate-700">Results vary. This is an educational product, not a guarantee of income.</p>
      </div>

      {/* Sticky mobile CTA. Hidden once the form is past step 1, where it would
          be telling someone to start something they are already halfway through. */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-500/30 bg-slate-950/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md ${step === 1 ? 'sm:hidden' : 'hidden'}`}>
        <button
          onClick={scrollToForm}
          id="sticky-mobile-cta"
          className="cta-glow inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-3.5 text-base font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          <span>Start With Step 1</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default JoinV2;
