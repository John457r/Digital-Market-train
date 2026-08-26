import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  MessageCircle,
  Menu,
  X,
  Plus
} from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  { name: "Samuel K.", location: "Port Moresby", text: "Market Digital Trading helped me grow my savings exponentially. The platform is secure and fast.", rating: 5 },
  { name: "Joyce A.", location: "Lae", text: "The support team is amazing. They guided me through my first deposit and I've been trading since.", rating: 5 },
  { name: "David M.", location: "Mount Hagen", text: "Premium trading experience with low fees. Highly recommended for PNG traders.", rating: 5 },
  { name: "Elizabeth T.", location: "Arawa", text: "I love the TradingView integration. It makes technical analysis so much easier.", rating: 5 },
  { name: "John L.", location: "Madang", text: "Security PIN and codes make me feel my funds are safe. Best platform in the Pacific.", rating: 5 },
  { name: "Ruth W.", location: "Goroka", text: "Started with 500 Kina and now I'm managing a significant portfolio.", rating: 5 },
  { name: "Paul S.", location: "Kimbe", text: "Fast withdrawals and professional support. A game changer for digital trading.", rating: 4 },
  { name: "Mary K.", location: "Wewak", text: "The dashboard is very intuitive even for beginners. Excellent UI/UX.", rating: 5 },
  { name: "Benson G.", location: "Popondetta", text: "Great market stats and live updates. I never miss a trade.", rating: 5 },
  { name: "Sarah P.", location: "Kavieng", text: "Finally a platform that caters to PNG with localized support.", rating: 5 },
  { name: "Michael R.", location: "Alotau", text: "Transparent and reliable. The ledger control gives me peace of mind.", rating: 5 },
  { name: "Grace B.", location: "Vanimo", text: "Multi-stage verification is exactly what we need for security in 2026.", rating: 5 },
  { name: "Thomas N.", location: "Lorengau", text: "Daily profits are consistent. The platform stability is top-notch.", rating: 5 },
  { name: "Doreen J.", location: "Daru", text: "Support is available 24/7. They really care about the traders.", rating: 5 },
  { name: "Chris H.", location: "Kundiawa", text: "Seamless mobile experience. I trade while on the go across provinces.", rating: 5 },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#800000] text-slate-900 font-sans selection:bg-[#ffd700] selection:text-black flex flex-col">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-[#800000] border-b border-[#990000] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-black tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffd700] rounded-xl flex items-center justify-center text-[#800000] font-black shadow-md">
              <TrendingUp size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">
                KINA <span className="text-[#ffd700]">DIGITAL</span>
              </span>
              <span className="text-[9px] text-gray-200 font-bold uppercase tracking-widest">Market Training Hub</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a href="#about" className="text-gray-200 hover:text-[#ffd700] transition-colors">About</a>
            <a href="#stats" className="text-gray-200 hover:text-[#ffd700] transition-colors">Performance</a>
            <a href="#testimonials" className="text-gray-200 hover:text-[#ffd700] transition-colors">Traders Voice</a>
            <a href="#faq" className="text-gray-200 hover:text-[#ffd700] transition-colors">FAQ</a>
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 rounded-xl text-white bg-[#5c0000] border border-[#800000] hover:bg-[#4a0000] transition-all font-bold"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 bg-[#ffd700] text-[#800000] font-black rounded-xl hover:bg-[#ffe066] transition-all shadow-md"
            >
              Start Training
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#5c0000] border-b border-[#800000] p-6 flex flex-col gap-4 text-white">
            <a href="#about" className="py-2 font-bold" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#stats" className="py-2 font-bold" onClick={() => setIsMenuOpen(false)}>Performance</a>
            <a href="#testimonials" className="py-2 font-bold" onClick={() => setIsMenuOpen(false)}>Traders Voice</a>
            <a href="#faq" className="py-2 font-bold" onClick={() => setIsMenuOpen(false)}>FAQ</a>
            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-[#800000] border border-[#a00000] rounded-xl text-center font-bold"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate("/register")}
                className="w-full py-3 bg-[#ffd700] text-[#800000] font-black rounded-xl text-center shadow-md"
              >
                Start Training Now
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-16 px-6 bg-[#800000] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ffd700] text-black text-xs font-black uppercase tracking-wider shadow-md">
              <ShieldCheck size={16} className="text-[#800000]" /> INSTITUTIONAL-GRADE DIGITAL MARKET TRAINING
            </span>
            
            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
              MASTER THE FINANCIAL MARKETS <br />
              <span className="text-[#ffd700]">WITH PRECISION & CONFIDENCE</span>
            </h1>

            <p className="text-gray-200 text-base md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Welcome to PNG’s premier <strong>Digital Market Training Academy</strong>. Empowering new financial market traders through 
              <span className="text-[#ffd700] font-bold"> multi-layer secure user access</span>, 
              <span className="text-[#ffd700] font-bold"> real-time live liquidity tracking</span>, and 
              <span className="text-[#ffd700] font-bold"> 1-on-1 expert mentorship</span> to turn market strategy into institutional mastery.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-10 py-4.5 bg-[#ffd700] text-[#800000] font-black text-base rounded-xl hover:bg-[#ffe066] transition-all shadow-xl flex items-center justify-center gap-3 group"
              >
                JOIN ACADEMY & START TRADING <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button 
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-10 py-4.5 bg-white/10 text-white font-black text-base rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
              >
                TRADER PORTAL ACCESS
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Light Pink Container Body */}
      <section className="flex-1 bg-[#fdf2f4] rounded-t-3xl shadow-inner py-16 px-6 md:px-12 text-slate-900">
        <div className="max-w-7xl mx-auto space-y-20">

          {/* Stats Bar */}
          <div id="stats" className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white border-2 border-[#800000]/20 p-8 rounded-2xl shadow-sm">
            {[
              { label: "Active Trainee Traders", value: "24.5k+" },
              { label: "Live Market Liquidity", value: "PGK 1.2B+" },
              { label: "Certified Mentors", value: "85+" },
              { label: "Training Completion Rate", value: "98.2%" },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="text-3xl md:text-4xl font-black text-[#800000]">{stat.value}</div>
                <div className="text-gray-600 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Welcome & Core Pillars Section */}
          <div id="about" className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-[#800000] text-white text-xs font-black uppercase rounded-lg tracking-widest">
                Welcome Message
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#800000] leading-tight">
                Empowering PNG’s Next Generation of Market Leaders
              </h2>
              <p className="text-slate-700 text-base leading-relaxed font-medium">
                Welcome to our Digital Market Training Hub. Designed specifically for ambitious traders across Papua New Guinea, our curriculum combines rigorous risk-management education with cutting-edge execution tools so you can trade seamlessly across global forex, commodities, and digital asset markets.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4 p-4 bg-white border border-[#800000]/20 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-[#800000] text-[#ffd700] rounded-xl flex items-center justify-center shrink-0 font-bold">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#800000] text-base">Multi-Layer Secure Access</h4>
                    <p className="text-xs text-gray-600 font-medium">Bank-grade security PINs, PIN authentication, and encrypted sessions protect your capital and account data round the clock.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white border border-[#800000]/20 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-[#ffd700] text-[#800000] rounded-xl flex items-center justify-center shrink-0 font-bold">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#800000] text-base">Live Liquidity & Market Analytics</h4>
                    <p className="text-xs text-gray-600 font-medium">Track real-time institutional volume, order book depth, and interactive TradingView charting tools directly from your terminal.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white border border-[#800000]/20 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-[#800000] text-white rounded-xl flex items-center justify-center shrink-0 font-bold">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#800000] text-base">1-on-1 Expert Mentorship</h4>
                    <p className="text-xs text-gray-600 font-medium">Get personalized trade setup reviews, daily PNG support guidance, and structured training paths from senior desk analysts.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="p-4 bg-white border-2 border-[#800000] rounded-3xl shadow-xl space-y-4">
                <img 
                  src="https://images.unsplash.com/photo-1611974717483-36009c309395?auto=format&fit=crop&q=80&w=800" 
                  alt="Digital Market Training Terminal" 
                  className="rounded-2xl w-full object-cover h-80"
                />
                <div className="p-4 bg-[#fdf2f4] rounded-2xl border border-[#800000]/20 text-center space-y-2">
                  <div className="text-xs font-black text-[#800000] uppercase tracking-widest">Digital Trading Academy Certificate</div>
                  <p className="text-xs text-gray-700 font-semibold">Join over 24,000 PNG traders advancing their financial knowledge with trusted institutional tools.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div id="testimonials" className="space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-[#800000] uppercase tracking-tight">Traders Community Voice</h2>
              <p className="text-gray-600 uppercase tracking-widest text-xs font-bold">Trusted by certified trainees across all PNG provinces</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((t, i) => (
                <div 
                  key={i} 
                  className="p-6 bg-white border border-[#800000]/20 rounded-2xl shadow-sm hover:border-[#800000] transition-all"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(t.rating)].map((_, j) => (
                      <Plus key={j} className="text-[#800000]" size={14} />
                    ))}
                  </div>
                  <p className="text-slate-700 italic text-sm mb-6 leading-relaxed font-medium">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#800000] text-[#ffd700] flex items-center justify-center font-black text-sm uppercase shadow-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-black text-[#800000] text-sm">{t.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-black text-center text-[#800000] uppercase tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "What is the Digital Market Training Academy?", a: "We provide structured educational modules, live market analysis, and a secure trading terminal for Papua New Guinea traders looking to master digital financial markets." },
                { q: "Is user access and capital protected?", a: "Yes. All user accounts are protected by multi-stage security verification PINs, strict encryption protocols, and live ledger oversight." },
                { q: "How do I access expert mentorship?", a: "Once registered, you gain access to live support desk routing and 1-on-1 mentorship channels to review trade plans and market setups." },
                { q: "What is the minimum balance required to practice?", a: "You can start learning with accessible account minimums starting at K50.00." },
              ].map((faq, i) => (
                <div key={i} className="p-6 bg-white border border-[#800000]/20 rounded-2xl shadow-sm space-y-2">
                  <h4 className="font-black text-[#800000] text-base">{faq.q}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5c0000] text-white py-12 px-6 border-t border-[#800000]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="col-span-2 space-y-4">
            <Link to="/" className="text-xl font-black tracking-tight flex items-center gap-3">
              <div className="w-9 h-9 bg-[#ffd700] rounded-xl flex items-center justify-center text-[#800000] font-black">
                <TrendingUp size={20} />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                KINA <span className="text-[#ffd700]">DIGITAL MARKET TRAINING</span>
              </span>
            </Link>
            <p className="text-gray-300 text-xs max-w-sm leading-relaxed">
              Empowering financial independence across Papua New Guinea through secure user access, live liquidity tracking, and expert market mentorship.
            </p>
          </div>
          <div>
            <h5 className="font-black mb-4 text-[#ffd700] uppercase text-xs tracking-widest">Navigation</h5>
            <ul className="space-y-2 text-xs text-gray-200 font-semibold">
              <li><Link to="/login" className="hover:text-white">Trader Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Open Account</Link></li>
              <li><a href="#about" className="hover:text-white">About Academy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black mb-4 text-[#ffd700] uppercase text-xs tracking-widest">Support</h5>
            <ul className="space-y-2 text-xs text-gray-200 font-semibold">
              <li><Link to="/dashboard/support" className="hover:text-white">Live Support Desk</Link></li>
              <li><a href="#faq" className="hover:text-white">Academy FAQ</a></li>
              <li><span className="text-gray-400">Port Moresby, PNG</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-[#800000] mt-8 text-center text-[11px] text-gray-300 font-bold">
          © 2026 DIGITAL MARKET TRAINING BUSINESS (PNG). ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Floating Support Button */}
      <button 
        onClick={() => navigate("/dashboard/support")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#ffd700] text-[#800000] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 border-2 border-[#800000]"
        title="Live Support Chat"
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
}
