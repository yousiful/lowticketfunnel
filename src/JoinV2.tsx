import { useState, useEffect } from 'react';
import {
  Users, BookOpen, ArrowRight, Zap, Award, Star, ChevronDown, ChevronUp,
  Shield, Target, Sparkles, Phone, FileText, Clock, Lock, Check, DollarSign
} from 'lucide-react';

/**
 * A/B variant of the live Freedom Club page (src/App.tsx), served at /join-v2.
 *
 * ORDER FLOW, and why it is one step.
 *
 * This page used to run its own "Step #1 / Step #2 Access" order form, cloned
 * from the GHL order form it hands off to. That was a mistake, and testing it
 * end to end is what surfaced it: the checkout at freedom.kenjiai.com/startnow
 * is a GHL two-step order form element (class `container-order-form-two-step`),
 * so a buyer went through two steps here, then landed on a page showing the
 * exact same two step labels and the same three fields. Even with the fields
 * prefilled it read as starting over rather than continuing.
 *
 * Verified against the live checkout on 2026-08-22:
 *   - The prefill works. full_name, email and phone populate GHL's inputs.
 *   - /startnow redirects to /7-dollar-new-funnel-704974, params carry across.
 *   - GHL's step state is internal to its Vue widget and only advances when
 *     its own step 1 is submitted. No query param lands a buyer on step 2, so
 *     the second step tab cannot be skipped from this side.
 *
 * So this page collects everything once, in a single form with no step chrome
 * of its own, and hands off exactly once. Do not add step tabs back, and do
 * not split this into two screens. The duplicated step widget was the problem.
 *
 * The one remaining piece of duplication lives in GHL, not here: switching that
 * funnel's order form element from its two-step layout to the one-step layout
 * would remove the last "Step #1" a buyer sees. That is a change in the GHL
 * page builder, not in this repo.
 *
 * Offer copy is a snapshot of App.tsx on purpose. App.tsx is the control and
 * stays untouched. If the offer copy changes there, mirror it here by hand.
 * Visual treatment intentionally diverges from the control: this variant
 * carries the closers.kenjiai.com styling (stat blocks, heavier type, warmer
 * high-contrast palette), so it is testing flow and styling together.
 */

const CHECKOUT_URL = 'https://freedom.kenjiai.com/startnow';

/**
 * The GHL order form prefills its name, email and phone inputs from these
 * query params (re-verified live on 2026-08-22), so nothing is retyped after
 * the hand-off.
 */
const PREFILL_PARAMS = { name: 'full_name', email: 'email', phone: 'phone' };

const MEMBERSHIP = {
  name: 'Freedom Club Membership',
  contentId: 'ace-monthly',
  price: 7,
  billing: 'per month',
};

/**
 * Upsell offered alongside the membership, and again after payment.
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

/**
 * Hero stat blocks, in the closers.kenjiai.com treatment.
 *
 * Every figure here is already stated elsewhere on this page, so the styling
 * pass did not introduce a single new claim. closers.kenjiai.com has invented
 * numbers on it (spots remaining, provider counts, live participant counts).
 * None of those came across and none should.
 */
const STATS = [
  {
    icon: DollarSign,
    value: '$7',
    label: 'Per month, cancel anytime',
    tint: 'from-amber-500/15 to-orange-500/10 border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Award,
    value: '12 yrs',
    label: 'In business',
    tint: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Zap,
    value: '60 sec',
    label: 'From payment to member area',
    tint: 'from-teal-500/15 to-cyan-500/10 border-teal-500/30 hover:border-teal-500/60 hover:shadow-teal-500/20',
    iconColor: 'text-teal-400',
  },
];

const HERO_CHIPS = [
  'Meta campaign templates',
  '30 ad hooks swipe file',
  'AI prompt pack',
  'Private community',
];

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
    q: 'Will I have to type my details twice?',
    a: "No. What you enter here carries over to the checkout page already filled in. All you add there is your card.",
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
    <div className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 28px, transparent 28px 56px)' }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:flex-row sm:gap-4">
        <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide sm:text-sm">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Access is open for a limited time. When it closes, this page comes down.
        </p>
        <button
          onClick={scrollToForm}
          className="shrink-0 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-300 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          Sign up →
        </button>
      </div>
    </div>
  );
}

type Details = { name: string; email: string; phone: string };

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, '').length >= 10;
}

function totalDue(addOn: boolean) {
  return MEMBERSHIP.price + (addOn ? PLACEMENT_OFFER.price : 0);
}

/**
 * Single-step order form. Details, add-on and total all live on one screen,
 * and submitting hands straight off to the encrypted GHL checkout for the card.
 *
 * There is deliberately no step header here. The old one mirrored the step
 * labels on the checkout page, which is precisely what made the hand-off feel
 * like starting over.
 */
function OrderForm({
  details,
  setDetails,
  addOn,
  setAddOn,
}: {
  details: Details;
  setDetails: (d: Details) => void;
  addOn: boolean;
  setAddOn: (v: boolean) => void;
}) {
  const [errors, setErrors] = useState<Partial<Details>>({});
  const [handingOff, setHandingOff] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handingOff) return;

    const next: Partial<Details> = {};
    if (!details.name.trim()) next.name = 'Please add your name';
    if (!isValidEmail(details.email)) next.email = 'Please add a valid email address';
    if (!isValidPhone(details.phone)) next.phone = 'Please add a valid phone number';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const total = totalDue(addOn);
    const w = window as TrackingWindow;
    // One action now covers what used to be two screens, so both the lead and
    // the checkout intent fire here.
    w.fbq?.('track', 'Lead', { content_name: MEMBERSHIP.name, variant: 'v2' });
    w.fbq?.('track', 'InitiateCheckout', {
      content_name: MEMBERSHIP.name,
      content_ids: [MEMBERSHIP.contentId],
      content_type: 'product',
      value: total,
      currency: 'USD',
      num_items: addOn ? 2 : 1,
      variant: 'v2',
    });
    w.dataLayer?.push({ event: 'signup_step_complete', variant: 'v2' });
    w.dataLayer?.push({ event: 'initiate_checkout', variant: 'v2', add_on: addOn });

    const url = new URL(CHECKOUT_URL);
    url.searchParams.set(PREFILL_PARAMS.name, details.name.trim());
    url.searchParams.set(PREFILL_PARAMS.email, details.email.trim());
    url.searchParams.set(PREFILL_PARAMS.phone, details.phone.trim());
    url.searchParams.set('variant', 'v2');
    if (addOn) url.searchParams.set('add_on', PLACEMENT_OFFER.addOnParam);

    // The checkout takes a few seconds to paint. Holding this state until the
    // browser leaves keeps the hand-off reading as one continuous action.
    setHandingOff(true);
    window.location.href = url.toString();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30';

  return (
    <div
      id="order-form"
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-500/30 bg-white shadow-[0_0_60px_rgba(16,185,129,0.15)]"
    >
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 text-center sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
          Join Freedom Club
        </p>
        <p className="mt-1 text-2xl font-black text-white">
          ${MEMBERSHIP.price}
          <span className="ml-1.5 text-sm font-semibold text-slate-400">{MEMBERSHIP.billing}</span>
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3 p-5 sm:p-6" noValidate>
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

        {/* Order bump. Real product, real price, both verified in Stripe and GHL. */}
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-4 py-3">
          <input
            type="checkbox"
            id="order-bump"
            className="mt-1 h-4 w-4 flex-shrink-0 accent-emerald-600"
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

        <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
          <span className="text-sm font-bold text-slate-900">Due today</span>
          <span className="text-xl font-black text-slate-900">${totalDue(addOn)}.00</span>
        </div>

        <button
          type="submit"
          id="order-submit"
          disabled={handingOff}
          className="w-full rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-black text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.99] disabled:translate-y-0 disabled:opacity-80"
        >
          {handingOff ? 'Opening secure checkout...' : `Pay $${totalDue(addOn)} and Get Instant Access`}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5 flex-shrink-0" />
          Card details are entered on our encrypted checkout. Billed monthly, cancel anytime.
        </p>
        <p className="text-center text-[11px] text-slate-400">
          Your details carry over, so the only thing left to add is your card.
        </p>
      </form>
    </div>
  );
}

/**
 * Post-purchase upsell, shown when the GHL thank-you page sends buyers back to
 * /join-v2?step=3. The membership is charged on the GHL checkout, on another
 * domain, so being sent back here is the only honest way to show this to
 * someone who has actually paid.
 */
function PostPurchaseUpsell({ details }: { details: Details }) {
  return (
    <div
      id="order-form"
      className="mx-auto w-full max-w-xl space-y-4 overflow-hidden rounded-2xl border border-emerald-500/30 bg-white p-5 shadow-[0_0_60px_rgba(16,185,129,0.15)] sm:p-6"
    >
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
  const [showUpsell, setShowUpsell] = useState(false);
  const [details, setDetails] = useState<Details>({ name: '', email: '', phone: '' });
  const [addOn, setAddOn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formInView, setFormInView] = useState(false);

  // The GHL thank-you redirect points at /join-v2?step=3. That contract predates
  // the single-step rewrite, so the param is still honoured.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('step');
    if (requested === '3') setShowUpsell(true);
    const w = window as TrackingWindow;
    w.dataLayer?.push({ event: 'page_variant', variant: 'v2' });
  }, []);

  /**
   * The sticky mobile bar and the order form both carry a primary CTA, so on a
   * phone they used to sit on screen together with the bar covering the form's
   * own button. One action at a time is the whole point of this rewrite, so the
   * bar stands down whenever the form itself is on screen.
   */
  useEffect(() => {
    const el = document.getElementById('order-form');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showUpsell]);

  const scrollToForm = () =>
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <UrgencyBar />

      <div className="sticky top-0 z-40 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-950 px-4 py-3 text-center text-white backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Premium Membership
          </span>
          <span className="hidden text-slate-600 sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Zap className="h-4 w-4 text-emerald-400" />
            Instant Access
          </span>
          <span className="hidden text-slate-600 sm:inline">·</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Users className="h-4 w-4 text-teal-400" />
            Hundreds of Entrepreneurs
          </span>
        </div>
      </div>

      {/* ==================== HERO + ORDER FORM ==================== */}
      <div className="relative overflow-hidden">
        {/* Ambient colour wash, borrowed from the closers hero treatment. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-4 top-16 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl sm:left-10 sm:h-80 sm:w-80" />
          <div className="absolute right-6 top-40 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl sm:right-16" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-teal-500/[0.08] blur-3xl sm:h-96 sm:w-96" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-14 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-emerald-300 shadow-lg shadow-emerald-500/20 backdrop-blur-sm sm:mb-8 sm:text-sm">
              <Target className="h-4 w-4 flex-shrink-0" />
              <span>Freedom Club · beginners welcome</span>
            </div>

            <h1 className="mb-4 px-1 text-4xl font-black leading-[1.05] tracking-tight text-white sm:mb-6 sm:px-0 sm:text-6xl md:text-7xl">
              Learn How to Run Ads
              <span className="block bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                That Actually Make Money
              </span>
              <span className="mt-2 block text-xl font-bold text-slate-300 sm:text-4xl md:text-5xl">
                Even If You've Never Run a Single Ad Before
              </span>
            </h1>

            <p className="mx-auto mb-6 max-w-2xl px-2 text-base leading-relaxed text-slate-300 sm:mb-8 sm:px-0 sm:text-xl">
              If you want to make money online, this is where you start. Templates, prompts, ad hooks, live support, and a private community.
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {HERO_CHIPS.map((chip) => (
                <div
                  key={chip}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 sm:px-4"
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300 sm:text-sm">{chip}</span>
                </div>
              ))}
            </div>

            {/* Stat blocks, the signature closers.kenjiai.com element. Numbers
                are the ones this page already stands behind. */}
            <div className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  className={`rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl sm:p-6 ${stat.tint}`}
                >
                  <stat.icon className={`mx-auto mb-3 h-7 w-7 sm:h-8 sm:w-8 ${stat.iconColor}`} />
                  <div className="mb-1 text-2xl font-black text-white sm:text-3xl">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-gradient-to-t from-[#0B1120] via-transparent to-transparent sm:rounded-2xl" />
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
                  className="mx-auto w-full max-w-[90vw] rounded-xl object-contain shadow-2xl shadow-emerald-500/10 sm:max-w-lg sm:rounded-2xl"
                />
              </picture>
            </div>

            <div className="order-1 lg:order-2">
              {showUpsell ? (
                <PostPurchaseUpsell details={details} />
              ) : (
                <>
                  <p className="mb-3 text-center text-sm font-bold text-white">
                    Fill this in once. Card details on the next screen, then you're in.
                  </p>
                  <OrderForm
                    details={details}
                    setDetails={setDetails}
                    addOn={addOn}
                    setAddOn={setAddOn}
                  />
                </>
              )}
            </div>
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
      <div className="border-y border-slate-800/50 bg-slate-900/40 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.2em] text-amber-400">
            The part nobody warns you about
          </p>
          <h2 className="mb-4 text-center text-3xl font-black text-white sm:text-5xl">
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
            <div className="inline-block max-w-2xl rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 p-8 backdrop-blur-sm">
              <p className="mb-3 text-xl font-black text-emerald-300 sm:text-2xl">
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
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              What lands in your account today
            </p>
            <h2 className="mb-4 text-3xl font-black text-white sm:text-5xl">
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
                className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-teal-500/[0.04] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
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
              Join Freedom Club
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-xs text-slate-500">
              You'll be inside the member area in under 60 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* ==================== MEMBER AREA ==================== */}
      <div className="border-y border-slate-800/50 bg-slate-900/40 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-300 sm:text-sm">
              <Lock className="h-3.5 w-3.5" />
              Your login works the second you join
            </div>
            <h2 className="mb-4 text-3xl font-black text-white sm:text-5xl">
              Here's What You See When You Log In
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-400">
              No mystery and no waiting around. This is the real member area, and every training in it is open to you from day one.
            </p>
          </div>

          <figure className="relative mb-10">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 blur-2xl" />
            <picture>
              <source type="image/webp" srcSet="/dashboard-library.webp" />
              <img
                src="/dashboard-library.jpg"
                alt="The Freedom Club member area training library, showing courses on chargebacks, AI tools, business funding, closing deals, client attraction, and paid ads certification"
                width={1400}
                height={756}
                loading="lazy"
                decoding="async"
                className="relative w-full rounded-xl border border-slate-700/60 shadow-2xl shadow-emerald-500/10 sm:rounded-2xl"
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
                  className="w-full rounded-xl border border-slate-700/60 shadow-xl shadow-emerald-500/5"
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
                  className="w-full rounded-xl border border-slate-700/60 shadow-xl shadow-emerald-500/5"
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
      <div className="border-y border-slate-800/50 bg-slate-900/40 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Real people, real results
            </p>
            <h2 className="mb-4 text-3xl font-black text-white sm:text-5xl">
              What Our Members Are Saying
            </h2>
            <p className="text-lg text-slate-400">Real results from real entrepreneurs</p>
          </div>

          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-teal-500/[0.06] px-6 py-4">
              <Users className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span className="text-sm font-bold text-white sm:text-base">Join hundreds of entrepreneurs just like you</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-orange-500/[0.06] px-6 py-4">
              <Award className="h-5 w-5 flex-shrink-0 text-amber-400" />
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
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-sm italic leading-relaxed text-slate-300">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
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
          <h2 className="mb-12 text-center text-3xl font-black text-white sm:text-5xl">
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
      <div className="relative overflow-hidden border-t border-slate-700/50 bg-gradient-to-br from-slate-900 via-[#0B1120] to-slate-900 px-4 py-20">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-amber-500/[0.07] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
            Get Instant Access to
            <span className="block bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.25)]">
              Freedom Club
            </span>
          </h2>

          <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-8 backdrop-blur-sm">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-300">
              Access is only open for a limited time.
            </p>
            <p className="mb-8 text-sm text-slate-400">Billed monthly · Cancel anytime</p>

            <button
              onClick={scrollToForm}
              id="final-cta"
              className="cta-glow group inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500 to-teal-600 px-14 py-6 text-xl font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] sm:w-auto sm:text-2xl"
            >
              Join Freedom Club
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

      <div className="border-t border-slate-800/50 bg-[#080D18] px-4 py-8 pb-28 text-center text-sm text-slate-600 sm:pb-8">
        <p>&copy; 2026 Freedom Club. All rights reserved.</p>
        <p className="mt-2 text-slate-700">Results vary. This is an educational product, not a guarantee of income.</p>
      </div>

      {/* Sticky mobile CTA. Stands down while the order form is on screen, and
          on the post-purchase upsell view, where it would be selling something
          the buyer already owns. */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-500/30 bg-[#0B1120]/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md ${showUpsell || formInView ? 'hidden' : 'sm:hidden'}`}>
        <button
          onClick={scrollToForm}
          id="sticky-mobile-cta"
          className="cta-glow inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/50 bg-gradient-to-br from-emerald-500 to-teal-600 px-5 py-3.5 text-base font-black text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          <span>Join Freedom Club</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default JoinV2;
