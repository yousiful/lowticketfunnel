import { useEffect } from 'react';
import { CheckCircle2, Clock, Lock, ArrowRight, Star, Video } from 'lucide-react';

/**
 * Paid ticket page for the webinar1 funnel (kenjiai.com/webinar1 -> registers
 * for the webinar -> this page sells the paid seat). Served at
 * freedom.kenjiai.com/webinar-ticket per Yousif's explicit path, 2026-08-29.
 *
 * TWO THINGS ARE STILL PLACEHOLDERS, both called out loudly below so this
 * never ships live by accident with fake numbers:
 *   1. TICKET_PRICE - the real price hasn't been given yet.
 *   2. CHECKOUT_URL - the real GHL/Stripe order form URL hasn't been given
 *      yet. Points at '#' until then so a stray click can't 404 or charge
 *      the wrong amount.
 * The ad video Yousif is sending separately is NOT embedded on this page -
 * that's the Meta ad creative, not page content. If a replay/preview clip
 * should also live on this page, that's a separate ask.
 */
const TICKET_PRICE = 'TBD'; // <-- replace with the real price, e.g. '17'
const CHECKOUT_URL = '#'; // <-- replace with the real GHL/Stripe order form URL

type TrackingWindow = Window & {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
};

const WHATS_INSIDE = [
  'A live seat in the webinar, not the free replay queue',
  'Priority Q&A - paid seats get answered first',
  'The full walkthrough of the Done-For-You ad system',
  'Replay access after the live session ends',
];

export default function WebinarTicket() {
  useEffect(() => {
    document.title = 'Get Your Webinar Seat';
  }, []);

  const handleBuyClick = () => {
    const w = window as TrackingWindow;
    w.fbq?.('track', 'InitiateCheckout', {
      content_name: 'Webinar Ticket',
      content_type: 'product',
      value: TICKET_PRICE === 'TBD' ? 0 : Number(TICKET_PRICE),
      currency: 'USD',
      num_items: 1,
    });
    w.dataLayer?.push({ event: 'initiate_checkout', plan: 'webinar_ticket' });
    window.location.href = CHECKOUT_URL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {CHECKOUT_URL === '#' && (
        <div className="bg-amber-500 text-slate-950 text-center text-sm font-bold py-2 px-4">
          Draft page: price and checkout link are placeholders, not live yet.
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6">
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            You're Registered - Reserve Your Paid Seat
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-5 text-balance">
            Lock In Your Spot Before The Room Fills Up
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Free registration gets you on the list. A paid seat gets you priority access, live Q&A, and the replay the second it ends.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-400" />
            What's Inside Your Seat
          </h2>
          <div className="space-y-3">
            {WHATS_INSIDE.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="mb-6">
            <span className="text-5xl font-black">
              {TICKET_PRICE === 'TBD' ? '$__' : `$${TICKET_PRICE}`}
            </span>
            <span className="text-slate-400 ml-2">one-time</span>
          </div>
          <button
            onClick={handleBuyClick}
            id="webinar-ticket-cta"
            className="cta-glow w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-emerald-400/50"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-3">
              Get My Seat
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <div className="flex items-center justify-center gap-6 mt-6 text-slate-400 text-xs flex-wrap">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Secure Checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Seats close when the webinar starts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
