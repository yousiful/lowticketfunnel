import { useState, useEffect } from 'react';
import { Timer, CheckCircle2, Users, Video, BookOpen, TrendingUp, DollarSign, Lock, ArrowRight, Zap, Award, Clock } from 'lucide-react';

function App() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [holidayName, setHolidayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [spotsLeft] = useState(Math.floor(Math.random() * 8) + 3);
  const [urgencyMessage, setUrgencyMessage] = useState('');

  useEffect(() => {
    const countdownEndTime = new Date(Date.now() + (51 * 60 * 1000));

    const determineHoliday = () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();

      if (month === 0 && day === 1) {
        return "NEW YEAR'S DAY";
      } else if (month === 0 && day >= 2 && day <= 7) {
        return 'NEW YEAR';
      } else if (month === 0 && day >= 13 && day <= 20) {
        return 'MLK DAY';
      } else if (month === 1 && day >= 10 && day <= 18) {
        return "PRESIDENT'S DAY";
      } else if (month === 1 && day === 14) {
        return "VALENTINE'S DAY";
      } else if (month === 2 && day >= 10 && day <= 20) {
        return "ST. PATRICK'S DAY";
      } else if (month === 3 && day >= 15 && day <= 25) {
        return 'EASTER';
      } else if (month === 4 && day >= 20 && day <= 31) {
        return 'MEMORIAL DAY';
      } else if (month === 5 && day >= 14 && day <= 21) {
        return "FATHER'S DAY";
      } else if (month === 6 && day >= 1 && day <= 7) {
        return 'INDEPENDENCE DAY';
      } else if (month === 8 && day >= 1 && day <= 7) {
        return 'LABOR DAY';
      } else if (month === 9 && day >= 1 && day <= 15) {
        return 'COLUMBUS DAY';
      } else if (month === 9 && day >= 20 && day <= 31) {
        return 'HALLOWEEN';
      } else if (month === 10 && day >= 1 && day <= 11) {
        return "VETERAN'S DAY";
      } else if (month === 10 && day >= 12 && day <= 22) {
        return 'PRE-BLACK FRIDAY';
      } else if (month === 10 && day >= 23 && day <= 26) {
        return 'BLACK FRIDAY';
      } else if (month === 10 && day >= 27 && day <= 30) {
        return 'CYBER MONDAY';
      } else if (month === 11 && day >= 1 && day <= 19) {
        return 'CHRISTMAS PREP';
      } else if (month === 11 && day >= 20 && day <= 25) {
        return 'CHRISTMAS';
      } else if (month === 11 && day >= 26 && day <= 31) {
        return 'NEW YEAR COUNTDOWN';
      } else {
        return 'FLASH SALE';
      }
    };

    setHolidayName(determineHoliday());

    const urgencyMessages = [
      `${spotsLeft} students joined in the last hour!`,
      '12-year proven track record of student success',
      'Backed by our 100% satisfaction guarantee',
      'Join thousands of thriving entrepreneurs',
      'Lifetime access + ongoing support included'
    ];

    let messageIndex = 0;
    const rotateUrgency = () => {
      setUrgencyMessage(urgencyMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % urgencyMessages.length;
    };

    rotateUrgency();
    const urgencyInterval = setInterval(rotateUrgency, 4000);

    const headlines = [
      {
        main: "Master Paid Ads That Drive Real Results",
        sub: "Learn Our Proven System Used by 1000+ Students"
      },
      {
        main: "Transform Your Business With Paid Advertising",
        sub: "12 Years of Expert Training at Your Fingertips"
      },
      {
        main: "Launch High-Performance Ad Campaigns",
        sub: "That Attract Your Ideal Customers"
      },
      {
        main: "Build Your Paid Ads Expertise",
        sub: "With Daily Live Training & Support"
      },
      {
        main: "Learn the Ads Skills Top Agencies Use",
        sub: "To Scale Businesses Profitably"
      },
      {
        main: "Access World-Class Paid Ads Training",
        sub: "From Industry Veterans With Proven Track Records"
      },
      {
        main: "Develop Profitable Ad Strategies",
        sub: "That Work Across Multiple Platforms"
      },
      {
        main: "Master the Art of Paid Traffic",
        sub: "With Comprehensive Step-by-Step Training"
      }
    ];

    const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    setHeadline(randomHeadline);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = countdownEndTime.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(urgencyInterval);
    };
  }, [spotsLeft]);

  const scrollToCTA = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTAClick = () => {
    window.location.href = 'https://freedom.kenjiai.com/7-dollar-new-funnel-704974';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Trust Banner - Deep Blue for Reliability */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700 text-white py-4 px-4 text-center font-semibold sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Award className="w-5 h-5" />
          <span className="text-sm sm:text-base">🎁 Limited Time {holidayName} Offer - {spotsLeft} Enrolled Today | Special Pricing Ends Monday</span>
          <Clock className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      {/* Floating Trust Message - Warm Orange for Friendliness */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-full shadow-2xl font-semibold hidden sm:block">
        {urgencyMessage}
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-4 shadow-lg">
            ✨ {holidayName} Limited-Time Offer - Ends Monday at Midnight
          </div>
          <div className="text-blue-400 font-semibold text-lg mb-6">
            🛡️ 100% Money-Back Guarantee - Risk-Free Investment | Trusted by 10,000+ Entrepreneurs
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {headline.main}
            <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent mt-2">
              {headline.sub}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get lifetime access to Paid Ads Freedom Club, live daily training, and comprehensive courses on ads, funding, sales, and taxes
          </p>

          {/* Product Image */}
          <div className="mb-8">
            <img
              src="/freedom_club_kenji_7dollar.png"
              alt="Freedom Club Complete Package - $10,000 Per Month System"
              className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          {/* Countdown Timer - Golden Yellow for Optimism */}
          <div className="bg-gradient-to-br from-slate-800 to-blue-900 border-4 border-amber-500 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">{holidayName} Special Pricing Available Until Monday:</h3>
            </div>
            <p className="text-blue-300 text-sm font-semibold mb-4">Lock in lifetime access at this exclusive rate - Standard pricing resumes Monday</p>
            <div className="flex justify-center gap-3 sm:gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3 sm:p-4 mb-2 shadow-lg">
                  <span className="text-3xl sm:text-5xl font-black text-white block">{String(timeLeft.days).padStart(2, '0')}</span>
                </div>
                <span className="text-slate-300 text-sm sm:text-base font-semibold">Days</span>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3 sm:p-4 mb-2 shadow-lg">
                  <span className="text-3xl sm:text-5xl font-black text-white block">{String(timeLeft.hours).padStart(2, '0')}</span>
                </div>
                <span className="text-slate-300 text-sm sm:text-base font-semibold">Hours</span>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3 sm:p-4 mb-2 shadow-lg">
                  <span className="text-3xl sm:text-5xl font-black text-white block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                </div>
                <span className="text-slate-300 text-sm sm:text-base font-semibold">Minutes</span>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3 sm:p-4 mb-2 shadow-lg">
                  <span className="text-3xl sm:text-5xl font-black text-white block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
                <span className="text-slate-300 text-sm sm:text-base font-semibold">Seconds</span>
              </div>
            </div>
          </div>

          {/* Value Showcase - Forest Green for Growth & Stability */}
          <div className="bg-gradient-to-br from-slate-800 to-blue-900 border-2 border-amber-400 rounded-2xl p-6 max-w-md mx-auto mb-8 shadow-2xl relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold animate-pulse">
              ⏰ {holidayName} Flash Sale - {spotsLeft} Joined Today
            </div>
            <div className="flex items-center justify-center gap-4 mb-4 mt-2">
              <div className="text-slate-300">
                <span className="text-3xl sm:text-4xl font-bold line-through">$997</span>
                <span className="block text-sm">Standard Value</span>
              </div>
              <ArrowRight className="w-8 h-8 text-amber-500" />
              <div className="text-emerald-400">
                <span className="text-5xl sm:text-6xl font-black">$7</span>
                <span className="block text-sm font-semibold text-blue-400">{holidayName} Special</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white px-4 py-3 rounded-lg font-semibold text-lg mb-2 shadow-lg">
              You Save $990 - 98% Discount
            </div>
            <div className="text-blue-300 text-xs font-semibold">
              🛡️ Protected by our 100% satisfaction guarantee
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCTAClick}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xl sm:text-2xl px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
            >
              Claim {holidayName} Special - Only $7
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-amber-400 font-semibold text-base animate-pulse">
              ⏰ Limited Time: {spotsLeft} entrepreneurs enrolled today before {holidayName} deadline
            </p>
            <p className="text-slate-300 text-sm">🛡️ Instant Access | One-Time Investment | Lifetime Updates | Risk-Free</p>
          </div>
        </div>
      </div>

      {/* Trust & Value Bar - Warm Orange for Enthusiasm */}
      <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 py-4 px-4 text-center">
        <p className="text-white font-semibold text-lg">
          🎯 {holidayName} Exclusive: {spotsLeft} Enrolled Today | Special Pricing Ends Monday | 100% Money-Back Guarantee
        </p>
      </div>

      {/* What You Get Section */}
      <div className="bg-slate-800/50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center mb-4">
            Your Complete Success Package - Just $7
          </h2>
          <p className="text-slate-300 text-center mb-4 text-lg">
            Lifetime access to our proven business growth system trusted by 10,000+ entrepreneurs
          </p>
          <p className="text-amber-400 text-center mb-12 text-sm font-semibold">
            🎯 $997 Value - {holidayName} Special Pricing Through Monday
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Paid Ads Freedom Club */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-orange-500 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-200">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Paid Ads Freedom Club</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Access to our exclusive community and proven strategies that have helped thousands scale their ad campaigns profitably
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Private community access with expert support</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Proven campaign templates and strategies</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Weekly Q&A and strategy sessions</span>
                </li>
              </ul>
            </div>

            {/* Live Daily Training */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-red-500 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-200">
              <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Live Daily Training</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Join us every day for live training sessions where we break down the latest strategies and answer your questions in real-time
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Daily live sessions with industry experts</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Replay access to all past training sessions</span>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Direct Q&A with successful entrepreneurs</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Course Modules */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-all duration-200">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Paid Ads Mastery</h4>
              <p className="text-slate-400 text-sm">
                Complete training on Facebook, Google, and YouTube ads that convert
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-all duration-200">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Business Funding</h4>
              <p className="text-slate-400 text-sm">
                Learn how to secure capital and funding for rapid business growth
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-all duration-200">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Sales Systems</h4>
              <p className="text-slate-400 text-sm">
                Proven frameworks to close more deals and scale your revenue
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-orange-500 transition-all duration-200">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Tax Strategies</h4>
              <p className="text-slate-400 text-sm">
                Keep more of what you earn with legal tax optimization tactics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Users className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Join 10,000+ Successful Members
            </h2>
          </div>
          <p className="text-slate-300 text-lg">
            12 years of proven results and transformations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
            <Award className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">12</div>
            <div className="text-slate-400">Years of Expertise</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
            <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">10,000+</div>
            <div className="text-slate-400">Active Members</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
            <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">$500M+</div>
            <div className="text-slate-400">Generated in Revenue</div>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Section - Forest Green for Stability */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 py-16 px-4 border-t border-b border-blue-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Your Investment is 100% Protected
            </h2>
            <p className="text-slate-300 text-lg">
              We stand behind our program with an ironclad guarantee
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-emerald-500 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-emerald-500 rounded-full p-3 flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Our 100% Satisfaction Guarantee</h3>
                <p className="text-slate-300 leading-relaxed">
                  Try the Paid Ads Freedom Club completely risk-free. If you're not completely satisfied with the training, community, and resources within 30 days, simply contact our support team for a full refund. No questions asked, no hoops to jump through.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">30-Day</div>
                <div className="text-sm text-slate-300">Money-Back Period</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">100%</div>
                <div className="text-sm text-slate-300">Refund Guaranteed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">Zero</div>
                <div className="text-sm text-slate-300">Risk to You</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-blue-700 rounded-xl p-6 text-center">
              <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">Secure Payment</h4>
              <p className="text-sm text-slate-400">Bank-level encryption protects your information</p>
            </div>

            <div className="bg-slate-800 border border-purple-700 rounded-xl p-6 text-center">
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">Proven Results</h4>
              <p className="text-sm text-slate-400">10,000+ entrepreneurs trust our training</p>
            </div>

            <div className="bg-slate-800 border border-emerald-700 rounded-xl p-6 text-center">
              <div className="bg-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-white mb-2">12 Years Strong</h4>
              <p className="text-sm text-slate-400">Over a decade of industry excellence</p>
            </div>
          </div>
        </div>
      </div>


      {/* Final CTA Section - Deep Blue & Purple for Trust & Luxury */}
      <div id="cta-section" className="bg-gradient-to-br from-blue-800 via-purple-800 to-blue-900 py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-full inline-block mb-4 font-semibold animate-pulse">
            ⏰ {holidayName} Limited Offer - {spotsLeft} Enrolled Today | Ends Monday
          </div>
          <Award className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
            Don't Miss Your {holidayName} Opportunity
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-4 font-semibold">
            Lock in your exclusive {holidayName} pricing before Monday's deadline
          </p>
          <p className="text-lg text-blue-200 mb-8 font-medium">
            Join 10,000+ entrepreneurs transforming their businesses. Time-limited {holidayName} special - protected by our risk-free guarantee.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-8 mb-8">
            <div className="text-6xl sm:text-7xl font-black text-white mb-4">$7</div>
            <div className="text-xl text-white/90 mb-6">One-time payment. Lifetime access. No recurring fees.</div>

            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span>Instant access to all programs</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span>Live daily training sessions</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span>Complete course library</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span>Private community access</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span>12 years of proven strategies</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <span className="font-bold">Lifetime updates & ongoing support</span>
              </li>
            </ul>

            <button
              onClick={handleCTAClick}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-2xl sm:text-3xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Claim My {holidayName} Deal - Just $7
              <CheckCircle2 className="w-6 h-6" />
            </button>

            <p className="text-white/90 mt-6 text-sm">
              🔒 Secure Checkout | ⚡ Instant Access | 🛡️ 100% Money-Back Guarantee
            </p>
          </div>

          <div className="text-white/80 text-sm space-y-2">
            <p className="font-semibold text-amber-300 text-base animate-pulse">⏰ {holidayName} Flash Sale: {spotsLeft} Enrolled Today - Deadline Monday Midnight</p>
            <p className="mb-2">🎁 Exclusive {holidayName} pricing - Limited time only, ends Monday at midnight</p>
            <p className="font-semibold">Special holiday rate expires Monday | Returns to $997 on Tuesday</p>
            <p className="text-xs mt-4">Act now before {holidayName} deadline - Risk-free with our 100% satisfaction guarantee. Start immediately after enrollment.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 py-8 px-4 text-center text-slate-500 text-sm border-t border-slate-800">
        <p>&copy; 2026 Paid Ads Freedom Club. All rights reserved.</p>
        <p className="mt-2">12 Years of Proven Results | 10,000+ Members Worldwide</p>
      </div>
    </div>
  );
}

export default App;
