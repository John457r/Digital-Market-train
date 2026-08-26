import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Award, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Building2,
  FileCheck2
} from "lucide-react";
import { motion } from "motion/react";

interface PlanItem {
  deposit: string;
  payout: string;
  duration: string;
  popular?: boolean;
}

const MINIMUM_TIER: PlanItem[] = [
  { deposit: "K100", payout: "K7,500", duration: "24 Hours" },
  { deposit: "K200", payout: "K12,500", duration: "24 Hours" },
  { deposit: "K500", payout: "K22,500", duration: "24 Hours", popular: true },
  { deposit: "K1,000", payout: "K35,000", duration: "48 Hours" },
  { deposit: "K2,000", payout: "K55,000", duration: "48 Hours" },
];

const SILVER_TIER: PlanItem[] = [
  { deposit: "K2,000", payout: "K244,000", duration: "3 Days" },
  { deposit: "K3,000", payout: "K320,000", duration: "3 Days", popular: true },
  { deposit: "K4,000", payout: "K410,000", duration: "5 Days" },
];

const GOLD_TIER: PlanItem[] = [
  { deposit: "K5,000", payout: "K148,000", duration: "7 Days" },
  { deposit: "K10,000", payout: "K290,000", duration: "7 Days" },
  { deposit: "K20,000", payout: "K650,000", duration: "10 Days", popular: true },
  { deposit: "K50,000", payout: "K1,800,000", duration: "14 Days" },
  { deposit: "K100,000", payout: "K502,000,000", duration: "21 Days" },
];

export default function InvestmentPlans() {
  const navigate = useNavigate();

  const handleSelectPackage = (depositAmount: string) => {
    navigate("/dashboard/support", {
      state: {
        initialMessage: `I want to start with the ${depositAmount} plan. Please provide the deposit account details.`
      }
    });
  };

  return (
    <div className="space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d0d12] via-[#121218] to-[#0a0a0d] border border-[#ffd700]/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(255,215,0,0.08)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffd700]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#ffd700]/10 border border-[#ffd700]/40 rounded-full text-[10px] font-black uppercase text-[#ffd700] tracking-[0.2em]">
            <Sparkles size={14} /> Guaranteed Capital Yield Packages
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
            High-Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ffe066] to-[#ffb700]">Investment Tiers</span>
          </h1>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Select an active trading pool tier below. All capital allocations are backed by institutional liquidity pools and PNG bank clearing protocols.
          </p>
        </div>
      </div>

      {/* TIER 1: MINIMUM TIER */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1a1a24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded-xl flex items-center justify-center text-[#00ff66]">
              <Zap size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Minimum Yield Tier</h2>
              <p className="text-xs text-gray-500 font-medium">Ideal for entry-level portfolio growth with rapid execution cycles</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-[#00ff66] bg-[#00ff66]/10 border border-[#00ff66]/30 px-3 py-1 rounded-full uppercase tracking-widest">
            Instant Activation
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MINIMUM_TIER.map((plan, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4 }}
              className={`relative bg-[#0d0d12] border ${plan.popular ? "border-[#00ff66] shadow-[0_0_30px_rgba(0,255,102,0.15)]" : "border-[#1a1a24] hover:border-[#333]"} rounded-2xl p-6 flex flex-col justify-between transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-[#00ff66] text-black text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Deposit Pool</span>
                  <span className="text-2xl font-black text-white">{plan.deposit}</span>
                </div>

                <div className="p-4 bg-black/60 border border-white/5 rounded-xl space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Guaranteed Payout</div>
                  <div className="text-2xl font-black text-[#00ff66] tracking-tight">{plan.payout}</div>
                </div>

                <div className="space-y-2 text-[11px] text-gray-400 font-medium">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Maturity Window</span>
                    <span className="text-white font-bold">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Risk Protection</span>
                    <span className="text-[#00ff66] font-bold">100% Capital Insured</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Clearing Method</span>
                    <span className="text-gray-300 font-bold">Local PNG Bank</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleSelectPackage(plan.deposit)}
                className="mt-6 w-full py-3.5 bg-[#00ff66] text-black font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#00e65c] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all"
              >
                Select {plan.deposit} Plan <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIER 2: SILVER TIER */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1a1a24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-400/10 border border-slate-400/30 rounded-xl flex items-center justify-center text-slate-300">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Silver Prime Tier</h2>
              <p className="text-xs text-gray-500 font-medium">Accelerated compound returns for mid-tier institutional clients</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-300 bg-slate-400/10 border border-slate-400/30 px-3 py-1 rounded-full uppercase tracking-widest">
            High Velocity
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {SILVER_TIER.map((plan, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4 }}
              className={`relative bg-[#0d0d12] border ${plan.popular ? "border-slate-300 shadow-[0_0_30px_rgba(203,213,225,0.15)]" : "border-[#1a1a24] hover:border-[#333]"} rounded-2xl p-6 flex flex-col justify-between transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-slate-300 text-black text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg">
                  Recommended
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Deposit Pool</span>
                  <span className="text-2xl font-black text-white">{plan.deposit}</span>
                </div>

                <div className="p-4 bg-black/60 border border-white/5 rounded-xl space-y-1">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Guaranteed Payout</div>
                  <div className="text-2xl font-black text-slate-200 tracking-tight">{plan.payout}</div>
                </div>

                <div className="space-y-2 text-[11px] text-gray-400 font-medium">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Maturity Window</span>
                    <span className="text-white font-bold">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Risk Protection</span>
                    <span className="text-slate-300 font-bold">Principal Guaranteed</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Audit Priority</span>
                    <span className="text-gray-300 font-bold">Priority Express</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleSelectPackage(plan.deposit)}
                className="mt-6 w-full py-3.5 bg-slate-200 text-black font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
              >
                Select {plan.deposit} Plan <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIER 3: GOLD TIER */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1a1a24] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffd700]/10 border border-[#ffd700]/40 rounded-xl flex items-center justify-center text-[#ffd700]">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Gold Wealth Vault</h2>
              <p className="text-xs text-gray-500 font-medium">Ultra high-yield capital allocation backed by sovereign asset guarantees</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-[#ffd700] bg-[#ffd700]/10 border border-[#ffd700]/30 px-3 py-1 rounded-full uppercase tracking-widest">
            Elite Institutional
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GOLD_TIER.map((plan, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4 }}
              className={`relative bg-gradient-to-b from-[#121118] to-[#0d0d12] border ${plan.popular ? "border-[#ffd700] shadow-[0_0_35px_rgba(255,215,0,0.2)]" : "border-[#ffd700]/30 hover:border-[#ffd700]/60"} rounded-2xl p-6 flex flex-col justify-between transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-[#ffd700] text-black text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg">
                  Maximum Return
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Deposit Pool</span>
                  <span className="text-2xl font-black text-white">{plan.deposit}</span>
                </div>

                <div className="p-4 bg-black/80 border border-[#ffd700]/20 rounded-xl space-y-1">
                  <div className="text-[10px] text-[#ffd700] font-bold uppercase tracking-widest">Guaranteed Payout</div>
                  <div className="text-2xl font-black text-[#ffd700] tracking-tight">{plan.payout}</div>
                </div>

                <div className="space-y-2 text-[11px] text-gray-400 font-medium">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Maturity Window</span>
                    <span className="text-white font-bold">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>VIP Manager</span>
                    <span className="text-[#ffd700] font-bold">Assigned Direct Line</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Sovereign Security</span>
                    <span className="text-gray-300 font-bold">Full Escrow Guarantee</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleSelectPackage(plan.deposit)}
                className="mt-6 w-full py-3.5 bg-gradient-to-r from-[#ffd700] via-[#ffe066] to-[#ffb700] text-black font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all"
              >
                Select {plan.deposit} Plan <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRUST BADGES FOOTER */}
      <div className="pt-8 border-t border-[#1a1a24] grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-xl flex items-center justify-center text-[#ffd700] shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">BPNG Compliance</div>
            <div className="text-[10px] text-gray-500 font-medium">Bank of Papua New Guinea Standard</div>
          </div>
        </div>

        <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded-xl flex items-center justify-center text-[#00ff66] shrink-0">
            <Lock size={24} />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">256-Bit SSL Vault</div>
            <div className="text-[10px] text-gray-500 font-medium">Bank-Grade Encryption Encryption</div>
          </div>
        </div>

        <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-xl flex items-center justify-center text-[#ffd700] shrink-0">
            <FileCheck2 size={24} />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">Instant Audit</div>
            <div className="text-[10px] text-gray-500 font-medium">Real-time Verified Ledger</div>
          </div>
        </div>

        <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded-xl flex items-center justify-center text-[#00ff66] shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-xs font-black text-white uppercase tracking-wider">Protected Yield</div>
            <div className="text-[10px] text-gray-500 font-medium">100% Capital Insurance Fund</div>
          </div>
        </div>
      </div>
    </div>
  );
}
