import { useState, useEffect } from 'react';
import { CheckCircle2, Users, Video, BookOpen, TrendingUp, DollarSign, Lock, ArrowRight, Zap, Award, Star, MessageCircle, ChevronDown, ChevronUp, Play, Shield, Target, BarChart3 } from 'lucide-react';

function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCTAClick = () => {
    window.location.href = 'https://freedom.kenjiai.com/7-dollar-new-funnel-704974';
  };

  const scrollToCTA = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      q: "I'm a complete beginner — is this for me?",
      a: "Absolutely. This training starts from the fundamentals and walks you through everything step by step. You don't need any prior experience with paid ads. If you can follow along with a video tutorial, you can do this."
    },
    {
      q: "Which ad platforms does this cover?",
      a: "The core training covers Facebook/Meta Ads, Google Ads, and YouTube Ads. You'll learn the principles that work across all platforms, plus platform-specific strategies for each."
    },
    {
      q: "Why is it only $7? What's the catch?",
      a: "No catch. We used to sell this training for $399. We dropped the price to $7 because we want to remove every barrier to entry. Our goal is to get you results — and once you see the value, many students choose to join our advanced programs. But there's zero obligation to buy anything else."
    },
    {
      q: "How quickly can I expect results?",
      a: "Many of our students launch their first profitable campaign within 7-14 days. The training is designed to get you running real ads fast, not just learning theory. Your speed depends on how quickly you implement what you learn."
    },
    {
      q: "What if I don't like it?",
      a: "You're covered by our 30-day money-back guarantee. If the training isn't what you expected, email our support team and we'll refund your $7 — no questions asked. You have nothing to lose."
    },
    {
      q: "How is this different from free YouTube tutorials?",
      a: "YouTube gives you fragments. This is a structured, start-to-finish system built on 12 years of running paid ads for real businesses. You get the exact frameworks, templates, and strategies in the right order — plus a community and live training you can't get from YouTube."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Clean Trust Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800 text-white py-3 px-4 text-center sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            30-Day Money-Back Guarantee
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            Instant Access
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-300">
            <Users className="w-4 h-4 text-blue-400" />
            10,247 Members
          </span>
        </div>
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-12">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Identity Hook */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>For entrepreneurs & business owners who want profitable ads</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight px-1 sm:px-0">
            Launch Your First
            <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Profitable Ad Campaign
            </span>
            <span className="block text-xl sm:text-4xl md:text-5xl mt-2 text-slate-300 font-bold">
              in 7 Days — Even If You're Starting From Zero
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Get the complete paid ads training system that's helped over 10,000 entrepreneurs stop wasting money on ads and start running campaigns that actually convert.
          </p>

          {/* Product Image */}
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
                alt="Paid Ads Freedom Club - Complete Training System including Close 4 Survival, Escape 9-5, Paid Ads Certified, Self-Liquidating Meta Ads, Client Attraction Secrets, AI Tools Overview, and Paid Ads Bootcamp"
                width={1024}
                height={1024}
                fetchPriority="high"
                decoding="async"
                className="w-full max-w-[90vw] sm:max-w-2xl md:max-w-3xl mx-auto rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-500/10 object-contain"
              />
            </picture>
          </div>

          {/* Quick Value + CTA */}
          <div className="max-w-xl mx-auto mb-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-slate-500">
                <span className="text-2xl font-bold line-through">$399</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600" />
              <div>
                <span className="text-5xl font-black text-white">$7</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              We used to charge $399. We dropped it to $7 to remove every barrier. No catch — just results.
            </p>
            <button
              onClick={handleCTAClick}
              id="hero-cta"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-lg sm:text-xl px-10 py-5 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-[1.03] transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              Start Running Profitable Ads — $7
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-slate-500 text-xs mt-4">
              One-time payment · Instant access · 30-day money-back guarantee
            </p>
          </div>
        </div>
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
              "You've boosted posts on Facebook and watched your money disappear with nothing to show for it",
              "You know paid ads work for other people, but every campaign you launch bleeds cash",
              "You're overwhelmed by targeting options, bidding strategies, and platform changes that happen every month",
              "You've watched countless free YouTube tutorials but still can't put the pieces together into a system that works",
              "You're stuck relying on organic reach and referrals — which means unpredictable income month to month",
              "You've thought about hiring an agency but can't justify $2,000+/month when you're not sure ads will work for your business"
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
                The difference between entrepreneurs who waste money on ads and those who print money with them isn't talent — it's having a proven framework. That's exactly what the Paid Ads Freedom Club gives you.
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
              Everything You Get for $7
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete business growth system — not just another course. Here's what's inside:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Paid Ads Freedom Club */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Paid Ads Freedom Club</h3>
              <p className="text-amber-400/80 text-sm font-medium mb-4">Previously $399 — Now included</p>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Our flagship training program. Step-by-step video modules that walk you from zero to running profitable campaigns on Facebook, Google, and YouTube.
              </p>
              <ul className="space-y-3">
                {[
                  "Complete Facebook/Meta Ads training (beginner → advanced)",
                  "Google Ads search & display campaign setup",
                  "YouTube Ads for reach and lead generation",
                  "Proven ad templates you can customize and launch today",
                  "Campaign optimization framework to cut waste and scale winners"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Daily Training */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 hover:border-red-500/30 transition-all duration-300 group">
              <div className="bg-gradient-to-br from-red-500 to-rose-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Live Daily Training</h3>
              <p className="text-red-400/80 text-sm font-medium mb-4">Ongoing support — not just pre-recorded videos</p>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Every day, our team goes live to break down what's working right now, answer your questions, and help you troubleshoot campaigns in real time.
              </p>
              <ul className="space-y-3">
                {[
                  "Daily live sessions — ask questions, get answers, see live walkthroughs",
                  "Full replay library so you never miss a session",
                  "Real-time strategy updates when platforms change their algorithms",
                  "Campaign reviews — submit your ads and get expert feedback",
                  "Private community access with other serious students"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bonus Courses */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              <span className="text-amber-400">Plus</span> — these bonus training modules:
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: TrendingUp, title: "Paid Ads Mastery", desc: "Advanced scaling strategies for Facebook, Google & YouTube", color: "from-orange-500 to-red-500" },
                { icon: DollarSign, title: "Business Funding", desc: "How to secure capital and credit lines to fund your ad spend", color: "from-blue-500 to-cyan-500" },
                { icon: BarChart3, title: "Sales Systems", desc: "Close more deals from the leads your ads generate", color: "from-green-500 to-emerald-500" },
                { icon: BookOpen, title: "Tax Strategies", desc: "Keep more profit with legal tax optimization for entrepreneurs", color: "from-purple-500 to-pink-500" }
              ].map((course, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-amber-500/20 transition-all duration-300">
                  <div className={`bg-gradient-to-br ${course.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                    <course.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{course.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{course.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mid-page CTA */}
          <div className="text-center">
            <button
              onClick={handleCTAClick}
              id="mid-cta"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-lg px-10 py-5 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-[1.03] transition-all duration-300 inline-flex items-center gap-3"
            >
              Get Everything for Just $7
              <ArrowRight className="w-5 h-5" />
            </button>
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

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            {[
              { value: "12", label: "Years in Business", icon: Award },
              { value: "10K+", label: "Members Trained", icon: Users },
              { value: "Daily", label: "Live Training Sessions", icon: Video }
            ].map((stat, i) => (
              <div key={i} className="text-center bg-slate-800/50 border border-slate-700/50 rounded-xl py-5 px-3">
                <stat.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-slate-400 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Marcus T.",
                role: "E-commerce Owner",
                text: "I was burning $200/day on Facebook ads with nothing to show for it. After going through the training, I rebuilt my campaigns using their framework. Within 3 weeks I was getting a 4.2x return on ad spend. The live daily sessions are worth the price alone.",
                stars: 5
              },
              {
                name: "Sarah K.",
                role: "Business Coach",
                text: "I was scared to touch paid ads. The step-by-step approach made it so simple. I launched my first Google Ads campaign following the exact templates and got 23 qualified leads in my first week. For $7 this is an absolute steal.",
                stars: 5
              },
              {
                name: "David R.",
                role: "Agency Owner",
                text: "I've been doing ads for years but was stuck at a plateau. The scaling strategies and the community feedback on my campaigns helped me identify blind spots. My agency added $8K/month in recurring revenue in 60 days.",
                stars: 5
              }
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
          <p className="text-slate-600 text-xs text-center mt-6">
            * Results may vary. These testimonials reflect individual experiences.
          </p>
        </div>
      </div>

      {/* ==================== ABOUT / AUTHORITY ==================== */}
      <div className="py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Award className="w-16 h-16 text-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-1">Your Instructor</p>
              <h3 className="text-2xl font-bold text-white mb-4">Kenji</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                With over 12 years of experience in paid advertising, Kenji has helped thousands of entrepreneurs go from zero to profitable with paid ads. His training programs have produced a community of 10,000+ members who use his frameworks to run successful campaigns across Facebook, Google, and YouTube.
              </p>
              <p className="text-slate-300 leading-relaxed">
                He created the Paid Ads Freedom Club because he was tired of seeing good entrepreneurs waste money on bad ad strategies. This $7 training is the same system he used to charge $399 for — now made accessible for everyone who's serious about growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== GUARANTEE ==================== */}
      <div className="bg-slate-900/50 border-y border-slate-800/50 py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            100% Money-Back Guarantee
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl mx-auto">
            Try the Paid Ads Freedom Club for 30 days. Go through the training, join the live sessions, use the templates. If you're not completely satisfied — for any reason — email us and we'll refund your $7. No questions asked.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div>
              <div className="text-2xl font-black text-emerald-400">30 Days</div>
              <div className="text-slate-400 text-xs">To try it out</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-slate-400 text-xs">Money back</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">$0</div>
              <div className="text-slate-400 text-xs">Risk to you</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FAQ ==================== */}
      <div className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-12">
            Common Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
              >
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Stop Guessing. Start Running
            <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Ads That Actually Work.
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            For less than a coffee, you get the complete system — training, templates, live support, and a community of 10,000+ entrepreneurs who've been where you are.
          </p>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-slate-500 text-2xl font-bold line-through">$399</span>
              <ArrowRight className="w-5 h-5 text-slate-600" />
              <span className="text-5xl sm:text-6xl font-black text-white">$7</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">
              One-time payment · Lifetime access · No recurring fees · No upsell required
            </p>

            <button
              onClick={handleCTAClick}
              id="final-cta"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xl sm:text-2xl px-12 py-6 rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:scale-[1.03] transition-all duration-300 inline-flex items-center justify-center gap-3"
            >
              Start Running Profitable Ads — $7
              <ArrowRight className="w-6 h-6" />
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
            We reserve the right to raise this price at any time. Lock in $7 while it's available.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 py-8 px-4 text-center text-slate-600 text-sm border-t border-slate-800/50">
        <p>&copy; 2026 Paid Ads Freedom Club. All rights reserved.</p>
        <p className="mt-2 text-slate-700">Results vary. This is an educational product, not a guarantee of income.</p>
      </div>
    </div>
  );
}

export default App;
