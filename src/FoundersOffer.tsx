import { useState, useEffect } from 'react';
import { CheckCircle2, Users, Video, BookOpen, TrendingUp, DollarSign, Lock, ArrowRight, Zap, Star, ChevronDown, ChevronUp, Shield, BarChart3, Sparkles } from 'lucide-react';

/**
 * "Founders" variant of the low-ticket funnel — lives on a hidden, unguessable
 * path (/founders-199) so the cheaper price isn't publicly discoverable.
 *
 * Different from the $7 page on purpose (for testing):
 *   - The Pre-Converted BOOK is the hero, not the ad-training bundle.
 *   - Price is $1.99 and the offer is "the book + the community".
 *   - The training modules are reframed as bonuses you unlock on top.
 *   - Embeds the real KenjiAI review widget (same one as the pricing page).
 *   - noindex + robots disallow keep it out of search.
 */

// ── The $1.99 checkout (book + community). Provided by Yousif 2026-06-21. ──
const CHECKOUT_URL = 'https://freedom.kenjiai.com/buythebookandcommunity';

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

function fireCheckout() {
  const w = window as FbqWindow;
  if (typeof window !== 'undefined' && w.fbq) {
    w.fbq('track', 'InitiateCheckout', {
      content_name: 'Pre-Converted Book + Community',
      content_ids: ['book-community-199'],
      content_type: 'product',
      value: 1.99,
      currency: 'USD',
      num_items: 1,
    });
  }
  window.location.href = CHECKOUT_URL;
}

/** Real KenjiAI reviews — same LeadConnector widget used on kenjiai.com/pricing. */
function KenjiReviews() {
  useEffect(() => {
    const SRC = 'https://reputationhub.site/reputation/assets/review-widget.js';
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const s = document.createElement('script');
    s.src = SRC;
    s.type = 'text/javascript';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-300 text-sm font-bold tracking-wide">Real Client Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            Don&apos;t Take Our Word For It
          </h2>
          <p className="text-base sm:text-lg font-medium text-slate-400 max-w-2xl mx-auto">
            Hear from the business owners already growing with KenjiAI.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <iframe
            className="lc_reviews_widget"
            src="https://reputationhub.site/reputation/widgets/review_widget/q5L4ttbBMHNxieXIcTVJ"
            frameBorder="0"
            scrolling="no"
            style={{ minWidth: '100%', width: '100%' }}
            title="KenjiAI Customer Reviews"
          />
        </div>
      </div>
    </div>
  );
}

export default function FoundersOffer() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Keep this page out of search — it's a private price.
    const prevTitle = document.title;
    document.title = 'Pre-Converted + Community — Founders Access';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex,nofollow';
    document.head.appendChild(robots);

    // Correct the page-load ViewContent value for this offer.
    const w = window as FbqWindow;
    if (w.fbq) {
      w.fbq('track', 'ViewContent', {
        content_name: 'Pre-Converted Book + Community',
        content_ids: ['book-community-199'],
        content_type: 'product',
        value: 1.99,
        currency: 'USD',
      });
    }

    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, []);

  const scrollToCTA = () =>
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });

  const bookGets = [
    'The exact framework for attracting leads who are ready to buy before they ever talk to you',
    'How to flip the script so prospects chase you instead of the other way around',
    'The pre-sell sequence that gets people to pay you first, not haggle later',
    'Real templates and scripts you can copy and deploy this week',
  ];

  const bonuses = [
    { icon: TrendingUp, title: 'AI Client Acquisition Engine', desc: 'The full paid-ads training for Meta, Google & YouTube. Was sold for $399.', color: 'from-amber-500 to-orange-500' },
    { icon: Video, title: 'Live Daily Training', desc: 'Daily live sessions, replays, and campaign reviews with the team.', color: 'from-red-500 to-rose-500' },
    { icon: BarChart3, title: 'Sales Systems', desc: 'Close more of the leads the book teaches you to attract.', color: 'from-green-500 to-emerald-500' },
    { icon: DollarSign, title: 'Business Funding Playbook', desc: 'Secure capital and credit lines to fund your growth.', color: 'from-blue-500 to-cyan-500' },
    { icon: BookOpen, title: 'Tax Strategies', desc: 'Keep more profit with legal tax optimization for entrepreneurs.', color: 'from-purple-500 to-pink-500' },
    { icon: Users, title: 'The Private Community', desc: 'A room full of operators sharing what is working right now.', color: 'from-sky-500 to-indigo-500' },
  ];

  const valueStack = [
    { name: 'Pre-Converted (the book)', value: 97 },
    { name: 'The Private Community', value: 297 },
    { name: 'AI Client Acquisition Engine', value: 399 },
    { name: 'Live Daily Training (90 days)', value: 497 },
    { name: 'Sales Systems Training', value: 197 },
    { name: 'Business Funding Playbook', value: 197 },
    { name: 'Tax Strategies for Entrepreneurs', value: 197 },
  ];
  const totalValue = valueStack.reduce((sum, item) => sum + item.value, 0);

  const faqs = [
    {
      q: 'What exactly do I get for $1.99?',
      a: 'You get Pre-Converted — the full book on attracting high-quality leads who pay you first — plus instant access to the private community and the bonus training stack. One payment, lifetime access.',
    },
    {
      q: 'Why is this only $1.99?',
      a: 'This is a private founders link. The book normally sells for $97 on its own. We dropped it to $1.99 on this page to get it into as many hands as possible. It is not the public price, so please do not share the link.',
    },
    {
      q: 'Is this just the book, or more?',
      a: 'The book is the core. But you also get the community and the full bonus library — the ad-training engine, live daily sessions, sales systems, funding and tax playbooks — all included at this price.',
    },
    {
      q: 'Do I need to be running ads already?',
      a: 'No. The book stands on its own and works whether you are pre-launch or already selling. When you are ready to scale, the bonus ad training is right there waiting for you.',
    },
    {
      q: 'What if it is not for me?',
      a: 'You are covered by a 30-day money-back guarantee. If it is not what you expected, email us and we will refund your $1.99. No questions asked.',
    },
    {
      q: 'How fast do I get access?',
      a: 'Instantly. The moment you check out you get the book and your community invite — you can be reading inside 60 seconds.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* ── Private-link banner (different angle than the $7 page) ── */}
      <div className="relative z-50 w-full overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white">
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:flex-row sm:gap-4">
          <p className="text-xs font-semibold sm:text-sm">
            <Sparkles className="inline w-3.5 h-3.5 -mt-0.5" /> You&apos;re on a private founders link.{' '}
            <span className="font-extrabold">This $1.99 price isn&apos;t public — please don&apos;t share it.</span>
          </p>
          <button
            onClick={scrollToCTA}
            className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-orange-700 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Get the book →
          </button>
        </div>
      </div>

      {/* Trust strip */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800 text-white py-3 px-4 text-center sticky top-0 z-40 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" /> 30-Day Money-Back Guarantee
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" /> Instant Access
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Users className="w-4 h-4 text-blue-400" /> 1,000+ Members
          </span>
        </div>
      </div>

      {/* ==================== HERO (book-first) ==================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-8 sm:pb-12">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid md:grid-cols-[300px_1fr] gap-8 sm:gap-12 items-center">

            {/* Book cover */}
            <div className="mx-auto md:mx-0 order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-amber-500/20 blur-3xl rounded-full" />
                <img
                  src="/preconverted-cover.png"
                  alt="Pre-Converted by Yousif Alias — How to Get High-Quality Leads Who Pay You First"
                  width={300}
                  height={450}
                  fetchPriority="high"
                  decoding="async"
                  className="relative w-52 sm:w-64 md:w-full rounded-xl shadow-2xl shadow-amber-500/20 border border-amber-500/20"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="order-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-5">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>The book they never teach you · by Yousif Alias</span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                Get Leads Who
                <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Pay You First
                </span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 mb-6 max-w-xl leading-relaxed mx-auto md:mx-0">
                <span className="text-white font-bold">Pre-Converted</span> is the exact system for attracting high-quality
                leads who are sold before they ever talk to you. Grab the book <span className="text-white font-semibold">and</span> the
                private community for less than a coffee.
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                <span className="text-slate-500 text-2xl font-bold line-through">$97</span>
                <ArrowRight className="w-5 h-5 text-slate-600" />
                <span className="text-5xl font-black text-white">$1.99</span>
              </div>

              <button
                onClick={fireCheckout}
                id="hero-cta"
                className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-amber-400/50"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-3">
                  Get the Book + Community for $1.99
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <p className="text-slate-500 text-xs mt-4">
                One-time payment · Instant access · 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== WHAT'S INSIDE THE BOOK ==================== */}
      <div className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-4 h-4" /> Inside Pre-Converted
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              The System They Never Teach You
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              This is the difference between chasing cold prospects and having buyers come to you already convinced.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {bookGets.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== BONUSES (training reframed) ==================== */}
      <div className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              And You Don&apos;t Just Get the Book
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Your $1.99 also unlocks the full member library and the community. Here&apos;s everything that comes with it:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {bonuses.map((b, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/40 hover:shadow-[0_4px_20px_rgba(245,158,11,0.1)] hover:-translate-y-1 transition-all duration-500">
                <div className={`bg-gradient-to-br ${b.color} w-11 h-11 rounded-lg flex items-center justify-center mb-4`}>
                  <b.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">{b.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Value Stack */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(245,158,11,0.08)]">
              <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-6">
                Here&apos;s What You&apos;re Actually Getting
              </h3>
              <ul className="space-y-3 mb-6">
                {valueStack.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 py-2 border-b border-slate-700/40 last:border-0">
                    <span className="flex items-center gap-3 text-slate-300 text-sm sm:text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      {item.name}
                    </span>
                    <span className="text-slate-400 font-mono text-sm sm:text-base flex-shrink-0">${item.value}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t-2 border-amber-500/40 pt-5 space-y-2">
                <div className="flex items-center justify-between text-base sm:text-lg">
                  <span className="text-slate-400 font-semibold">Total Real Value</span>
                  <span className="text-slate-300 font-bold line-through">${totalValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xl sm:text-2xl">
                  <span className="text-white font-black">Your Price Today</span>
                  <span className="text-amber-400 font-black">$1.99</span>
                </div>
                <p className="text-emerald-400 text-center text-sm font-bold pt-2">
                  Less than a coffee for everything above.
                </p>
              </div>
            </div>
          </div>

          {/* Mid CTA */}
          <div className="text-center mt-10">
            <button
              onClick={fireCheckout}
              id="mid-cta"
              className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-lg sm:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-amber-400/50 gap-3"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-3">
                Yes, I Want In For $1.99
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-slate-500 text-xs mt-3">You&apos;ll be inside in under 60 seconds.</p>
          </div>
        </div>
      </div>

      {/* ==================== REVIEWS (from kenjiai.com/pricing) ==================== */}
      <KenjiReviews />

      {/* ==================== GUARANTEE ==================== */}
      <div className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">100% Money-Back Guarantee</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl mx-auto">
            Read the book, join the community, use the bonuses for 30 days. If you don&apos;t love it, email us and we&apos;ll
            refund your $1.99. No questions asked.
          </p>
        </div>
      </div>

      {/* ==================== FAQ ==================== */}
      <div className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">Common Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
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
      <div id="cta-section" className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-t border-slate-700/50 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Grab the Book Before
            <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              This Link Comes Down.
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            $1.99 gets you Pre-Converted, the community, and the entire bonus library. This founders price is only on this private link.
          </p>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-slate-500 text-2xl font-bold line-through">$97</span>
              <ArrowRight className="w-5 h-5 text-slate-600" />
              <span className="text-5xl sm:text-6xl font-black text-white">$1.99</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">One-time payment · Lifetime access · No recurring fees</p>

            <button
              onClick={fireCheckout}
              id="final-cta"
              className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xl sm:text-2xl px-14 py-6 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center border border-amber-400/50 gap-3"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-3">
                Lock In My $1.99 Access
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <div className="flex items-center justify-center gap-6 mt-6 text-slate-400 text-xs flex-wrap">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure Checkout</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Instant Access</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> 30-Day Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 py-8 px-4 pb-28 sm:pb-8 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>&copy; 2026 KenjiAI. All rights reserved.</p>
        <p className="mt-2 text-slate-700">Results vary. This is an educational product, not a guarantee of income.</p>
      </div>

      {/* Sticky mobile CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-amber-500/30 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col leading-tight">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Founders Price</span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-slate-500 text-sm line-through font-bold">$97</span>
              <span className="text-white text-2xl font-black">$1.99</span>
            </span>
          </div>
          <button
            onClick={fireCheckout}
            id="sticky-mobile-cta"
            className="flex-1 group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-base px-5 py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/50 inline-flex items-center justify-center gap-2"
          >
            <span>Get It For $1.99</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
