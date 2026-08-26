import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { mockDb } from "../../lib/mockDb";
import { formatCurrency, cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Building2, 
  User, 
  Hash, 
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Withdraw() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [bankData, setBankData] = useState({
    bankName: "",
    accountName: "",
    city: "",
    swiftCode: "",
    accountNumber: "",
    amount: ""
  });

  const [codes, setCodes] = useState({
    pin: "",
    bankingCode: "",
    withdrawalCode: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankData({ ...bankData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1 && (!bankData.bankName || !bankData.amount)) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);
    setError("");

    // Check if security verification block is enabled
    if (profile.requireVerification) {
      setError(profile.verificationMessage || "Verification required. Please contact Live Support to complete verification before initiating withdrawals.");
      setLoading(false);
      return;
    }

    // Check if security codes are expired or paused
    if (profile.codeTimerPaused) {
      setError("Security codes timer is currently paused by the support desk.");
      setLoading(false);
      return;
    }
    if (profile.codeExpiresAt && Date.now() > profile.codeExpiresAt) {
      setError("Security codes have expired. Please visit Support page to request new codes.");
      setLoading(false);
      return;
    }

    // Validate security steps
    if (codes.pin !== profile.securityPin) {
      setError("Incorrect Security PIN.");
      setLoading(false);
      return;
    }

    if (codes.bankingCode !== profile.bankingCode) {
      setError("Invalid Banking Security Code. Please contact support.");
      setLoading(false);
      return;
    }

    if (codes.withdrawalCode !== profile.withdrawalCode) {
      setError("Invalid Withdrawal Confirmation Code.");
      setLoading(false);
      return;
    }

    const amount = parseFloat(bankData.amount);
    if (amount > (profile.balance || 0)) {
      setError("Insufficient balance for this transaction.");
      setLoading(false);
      return;
    }

    // Instant Auto-Deduction
    const newBalance = Math.max(0, (profile.balance || 0) - amount);

    try {
      // Create transaction object
      const txData: any = {
        userId: profile.uid,
        userName: `${profile.firstName} ${profile.lastName}`,
        amount: amount,
        type: "withdrawal",
        status: "pending",
        bankDetails: {
          bankName: bankData.bankName,
          accountName: bankData.accountName,
          city: bankData.city,
          swiftCode: bankData.swiftCode,
          accountNumber: bankData.accountNumber
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        // Create transaction in Firebase
        await addDoc(collection(db, "transactions"), {
          ...txData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Instant Auto-Deduction & Clear codes in Firebase
        await updateDoc(doc(db, "users", profile.uid), {
          balance: newBalance,
          bankingCode: "",
          withdrawalCode: ""
        });
      } catch (dbErr: any) {
        console.warn("Database error, saving transaction to mock storage:", dbErr);
      }

      // Save to mock storage
      mockDb.saveTransaction(txData);
      
      // Update local profile state
      const updatedProfile = { 
        ...profile, 
        balance: newBalance, 
        bankingCode: "", 
        withdrawalCode: "" 
      };
      mockDb.saveUser(updatedProfile);

      setSuccess(true);
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      setError("Transaction failed. System error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // If user requires verification, show support block screen
  if (profile?.requireVerification) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white border-2 border-[#800000] rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 border-2 border-[#800000] rounded-full flex items-center justify-center mx-auto text-[#800000]">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#800000] uppercase tracking-tight">Identity Audit Required</h2>
          <div className="p-6 bg-[#fdf2f4] rounded-2xl border border-[#800000]/20 text-slate-800 text-sm font-semibold leading-relaxed">
            {profile.verificationMessage || "Verification required: Please contact Live Support to complete your identity audit before initiating withdrawals."}
          </div>
          <button 
            onClick={() => navigate("/dashboard/support", { state: { initialMessage: "Hello, I am requesting assistance with completing my account verification for withdrawal." } })}
            className="w-full py-4 bg-[#800000] text-white font-black uppercase tracking-wider rounded-xl hover:bg-[#660000] transition-all shadow-lg flex items-center justify-center gap-3 text-sm"
          >
            <MessageCircle size={20} />
            Chat with Live Support
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-emerald-600 shadow-md">
          <CheckCircle2 className="text-emerald-600" size={48} />
        </div>
        <h2 className="text-3xl font-black text-[#800000] uppercase tracking-tight mb-4">Request Transmitted</h2>
        <p className="text-slate-700 text-sm mb-4 leading-relaxed font-medium">
          Your withdrawal request of <span className="text-[#800000] font-black">{formatCurrency(parseFloat(bankData.amount))}</span> has been submitted.
        </p>
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-8 font-bold">
          Deduction Applied Instantly: Remaining Balance {formatCurrency((profile?.balance || 0))}
        </p>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="px-10 py-4 bg-[#800000] text-white rounded-xl hover:bg-[#660000] transition-colors uppercase text-xs font-black tracking-widest shadow-md"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-black text-[#800000] uppercase tracking-tight mb-2">Liquidity Exit Pipeline</h2>
        <div className="flex items-center justify-center gap-2 md:gap-4 py-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 border shadow-sm",
                step === s ? "bg-[#ffd700] text-black border-black font-extrabold scale-110" : step > s ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-gray-400 border-gray-300"
              )}>
                {s}
              </div>
              {s !== 4 && <div className={cn("w-8 md:w-16 h-[2px]", step > s ? "bg-[#800000]" : "bg-gray-300")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-[#800000]/30 rounded-3xl overflow-hidden shadow-xl relative">
        <div className="p-6 md:p-10">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-[#800000] p-4 rounded-xl text-sm flex items-center gap-3 mb-6">
              <AlertCircle size={20} className="shrink-0 text-[#800000]" />
              <span className="font-bold uppercase text-xs tracking-wider">{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 <h3 className="text-xs font-black text-[#800000] uppercase tracking-[0.3em] mb-6">Step 1: Bank Recipient Details</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Bank Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input name="bankName" required className="w-full bg-white border-2 border-[#800000]/40 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:border-[#800000] outline-none font-bold" placeholder="e.g. BSP PNG / Kina Bank" onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Account Holder Name</label>
                       <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input name="accountName" required className="w-full bg-white border-2 border-[#800000]/40 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:border-[#800000] outline-none font-bold" placeholder="Full Account Name" onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Swift Code / BSB Code</label>
                       <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input name="swiftCode" required className="w-full bg-white border-2 border-[#800000]/40 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:border-[#800000] outline-none font-bold" placeholder="SWIFT/BSB" onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Account Number</label>
                       <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input name="accountNumber" required className="w-full bg-white border-2 border-[#800000]/40 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:border-[#800000] outline-none font-bold" placeholder="Account Number" onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2 border-t border-[#800000]/20 pt-4 mt-2">
                       <label className="text-xs font-black text-[#800000] uppercase tracking-wider">Withdrawal Amount (PGK / Kina)</label>
                       <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-[#800000]">K</div>
                        <input type="number" name="amount" required className="w-full bg-white border-2 border-[#800000] rounded-xl py-4 pl-10 pr-4 text-2xl font-black text-[#800000] focus:border-[#ffd700] outline-none" placeholder="0.00" onChange={handleChange} />
                      </div>
                      <div className="flex justify-between items-center text-xs uppercase font-bold text-gray-600 mt-2">
                        <span>Available Balance: {formatCurrency(profile?.balance || 0)}</span>
                        <span>Min Withdrawal: K50.00</span>
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center max-w-sm mx-auto">
                 <div className="w-16 h-16 bg-[#800000] text-[#ffd700] rounded-full flex items-center justify-center mx-auto border-2 border-[#800000] shadow-md mb-2">
                  <ShieldCheck size={32} />
                 </div>
                 <h3 className="text-sm font-black text-[#800000] uppercase tracking-widest">Identity Authentication</h3>
                 <p className="text-xs text-gray-600 uppercase font-bold">Please provide your personal security PIN.</p>
                 <div className="relative">
                    <input 
                      type="password" 
                      maxLength={6}
                      className="w-full bg-white border-2 border-[#800000] rounded-xl py-4 text-center text-3xl tracking-[1em] font-black text-[#800000] focus:border-[#ffd700] outline-none" 
                      placeholder="••••••"
                      value={codes.pin}
                      onChange={(e) => setCodes({ ...codes, pin: e.target.value })}
                    />
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center max-w-sm mx-auto">
                 <div className="w-16 h-16 bg-[#ffd700] text-[#800000] rounded-full flex items-center justify-center mx-auto border-2 border-[#800000] shadow-md mb-2">
                  <Lock size={32} />
                 </div>
                 <h3 className="text-sm font-black text-[#800000] uppercase tracking-widest">Banking Security Lock</h3>
                 <p className="text-xs text-gray-600 uppercase font-bold">Enter the Banking Security Code issued to your account.</p>
                 <div className="relative">
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-[#800000] rounded-xl py-4 text-center text-xl font-black text-[#800000] focus:border-[#ffd700] outline-none uppercase tracking-[0.3em]" 
                      placeholder="B-XXXXXX"
                      value={codes.bankingCode}
                      onChange={(e) => setCodes({ ...codes, bankingCode: e.target.value.toUpperCase() })}
                    />
                 </div>
                 <button className="text-xs font-black text-[#800000] uppercase hover:underline" onClick={() => navigate("/dashboard/support")}>Need assistance? Contact Support</button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-center max-w-sm mx-auto">
                 <div className="w-16 h-16 bg-red-100 text-[#800000] rounded-full flex items-center justify-center mx-auto border-2 border-[#800000] shadow-md mb-2">
                  <AlertCircle size={32} />
                 </div>
                 <h3 className="text-sm font-black text-[#800000] uppercase tracking-widest">Final Confirmation</h3>
                 <p className="text-xs text-gray-600 uppercase font-bold">Enter the specific Withdrawal Confirmation Code generated for this transaction.</p>
                 <div className="relative">
                    <input 
                      type="text" 
                      className="w-full bg-white border-2 border-[#800000] rounded-xl py-4 text-center text-xl font-black text-[#800000] focus:border-[#ffd700] outline-none uppercase tracking-[0.3em]" 
                      placeholder="W-XXXXXX"
                      value={codes.withdrawalCode}
                      onChange={(e) => setCodes({ ...codes, withdrawalCode: e.target.value.toUpperCase() })}
                    />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-6 border-t border-[#800000]/20 flex justify-between gap-4">
             {step > 1 && (
               <button 
                  onClick={() => setStep(step - 1)}
                  className="px-8 py-3.5 bg-white border-2 border-[#800000] text-[#800000] rounded-xl uppercase text-xs font-black tracking-widest hover:bg-red-50 transition-all"
               >
                 Back
               </button>
             )}
             <button 
                onClick={step === 4 ? handleSubmit : handleNext}
                disabled={loading}
                className={cn(
                  "flex-1 md:flex-none md:min-w-[220px] py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-md flex items-center justify-center gap-2",
                   step === 4 ? "bg-[#800000] text-white hover:bg-[#660000]" : "bg-[#800000] text-white hover:bg-[#660000]"
                )}
             >
               {loading ? "PROCESSING..." : step === 4 ? "AUTHORIZE WITHDRAWAL" : "CONTINUE PIPELINE"}
               <ArrowRight size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
