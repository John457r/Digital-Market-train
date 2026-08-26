import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Activity, 
  CreditCard,
  ChevronRight,
  TrendingDown,
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency, cn } from "../../lib/utils";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  LineChart
} from "recharts";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Transaction } from "../../types";
import { mockDb } from "../../lib/mockDb";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, Link } from "react-router-dom";

export default function DashboardOverview() {
  const { profile, isMock } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [onboardingOpen, setOnboardingOpen] = useState(!profile?.onboarded);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile?.uid) return;

    if (isMock) {
      const mockTxs = mockDb.getTransactions().filter(t => t.userId === profile.uid);
      setRecentTransactions(mockTxs.slice(0, 5));
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", profile.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setRecentTransactions(txs);
    }, (err) => {
      console.error("Firestore listen error, using mock:", err);
      const mockTxs = mockDb.getTransactions().filter(t => t.userId === profile.uid);
      setRecentTransactions(mockTxs.slice(0, 5));
    });

    return () => unsubscribe();
  }, [profile?.uid, isMock]);

  const chartData = [
    { name: "Mon", value: 1200 },
    { name: "Tue", value: 4500 },
    { name: "Wed", value: 3800 },
    { name: "Thu", value: 6200 },
    { name: "Fri", value: 8900 },
    { name: "Sat", value: 11200 },
    { name: "Sun", value: profile?.totalProfit || 12500 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Onboarding Modal */}
      <AnimatePresence>
        {onboardingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/90 backdrop-blur-sm"
               onClick={() => setOnboardingOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0d0d0d] border border-[#00ff66]/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,102,0.15)]"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#00ff66]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00ff66]/20">
                  <TrendingUp className="text-[#00ff66]" size={32} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Welcome to Future Trading</h2>
                <p className="text-gray-400 text-sm italic">"How much do you want to start with?"</p>
              </div>

              <div className="space-y-4">
                 <p className="text-sm text-gray-500 leading-relaxed text-center">
                  To activate your account, a minimum deposit of <span className="text-[#00ff66] font-bold underline">$100 (100 Kina)</span> is required. Your dedicated portfolio manager is ready to assist you.
                </p>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex items-center gap-4 hover:border-[#ffd700] transition-colors cursor-pointer group" onClick={() => navigate("/dashboard/support")}>
                   <div className="w-10 h-10 bg-[#ffd700] text-black rounded flex items-center justify-center font-black">
                    <Clock size={20} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#ffd700]">Talk to Live Support</h4>
                      <p className="text-[10px] text-gray-500 uppercase">Instant Activation Details</p>
                   </div>
                   <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <button 
                  onClick={() => setOnboardingOpen(false)}
                  className="w-full py-4 bg-[#00ff66] text-black font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] transition-transform"
                >
                  I Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Equity Balance", value: profile?.balance || 0, icon: Wallet, color: "text-[#800000]", bg: "bg-[#800000]/10" },
          { label: "Total Profit", value: profile?.totalProfit || 0, icon: TrendingUp, color: "text-[#800000]", bg: "bg-[#ffd700]/30" },
          { label: "24h Volume", value: 12450.85, icon: Activity, color: "text-blue-800", bg: "bg-blue-100" },
          { label: "Active Trades", value: 3, icon: LineChart, color: "text-purple-800", bg: "bg-purple-100", isCurrency: false },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-[#800000]/20 rounded-2xl relative overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={22} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-[#800000] bg-[#ffd700] px-2.5 py-0.5 rounded-full uppercase">
                <ArrowUpRight size={10} /> 12%
              </div>
            </div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-black text-[#800000]">
              {stat.isCurrency === false ? stat.value : formatCurrency(stat.value)}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-8 bg-white border border-[#800000]/20 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8 text-center md:text-left">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#800000] mb-1">Growth Performance</h3>
              <div className="text-3xl font-black text-slate-900 flex items-center gap-3">
                {formatCurrency(profile?.balance || 0)}
                <span className="text-xs text-black bg-[#ffd700] px-2.5 py-1 rounded-lg font-black">+24.5% OVERALL</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              {["1D", "1W", "1M", "1Y", "ALL"].map(t => (
                <button key={t} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", t === "1W" ? "bg-[#800000] text-white" : "text-gray-500 hover:text-black hover:bg-gray-100")}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800000" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#666", fontSize: 10, fontWeight: "bold" }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#800000", border: "none", borderRadius: "12px", color: "#fff" }}
                  itemStyle={{ color: "#ffd700", fontWeight: "bold" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#800000" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Logged */}
        <div className="space-y-6">
          <div className="p-8 bg-white border border-[#800000]/20 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 bg-[#800000] text-[#ffd700] rounded-full flex items-center justify-center mb-4 border border-[#800000]">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-sm font-black uppercase text-[#800000] mb-2">Account Status: {profile?.status}</h4>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed mb-6 font-semibold">
              Verified PNG Institutional Account. <br />
              Kina Bank Multi-Tier Encrypted Ledger.
            </p>
            <button className="w-full py-3 bg-[#fdf2f4] border border-[#800000]/30 text-[#800000] rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#800000] hover:text-white transition-all">
              <ExternalLink size={12} /> View Banking Certificate
            </button>
          </div>

          <div className="p-8 bg-white border border-[#800000]/20 rounded-2xl h-[400px] flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase text-[#800000] tracking-[0.3em]">Institutional Ledger</h3>
              <Link to="/dashboard/withdraw" className="text-[10px] font-black text-[#800000] uppercase hover:underline">View All</Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {recentTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Clock size={32} strokeWidth={1} className="mb-2" />
                  <p className="text-xs italic">No transactions recorded</p>
                </div>
              ) : (
                recentTransactions.map((tx, i) => (
                  <div key={i} className="p-3 bg-[#fdf2f4] border border-[#800000]/10 rounded-xl hover:border-[#800000]/30 transition-all space-y-1">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg shrink-0", tx.type === "deposit" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-[#800000]")}>
                        {tx.type === "deposit" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 uppercase">{tx.type}</div>
                        <div className="text-[9px] text-gray-500 font-bold uppercase">
                          {tx.status} {tx.createdAt?.seconds ? `// ${new Date(tx.createdAt.seconds * 1000).toLocaleDateString()}` : ""}
                        </div>
                      </div>
                      <div className={cn("text-xs font-black", tx.type === "deposit" ? "text-emerald-700" : "text-[#800000]")}>
                        {tx.type === "deposit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                    {tx.status === "rejected" && tx.rejectionReason && (
                      <div className="mt-1 text-[10px] bg-red-100 text-[#800000] p-2 rounded-lg font-bold border border-red-200">
                        Rejection Reason: {tx.rejectionReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
