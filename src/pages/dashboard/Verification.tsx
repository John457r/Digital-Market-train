import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare,
  KeyRound,
  FileCode,
  ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";

export default function Verification() {
  const { profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) return;

    const calculateRemaining = () => {
      if (profile.codeTimerPaused) {
        return profile.codeTimerPausedRemaining ?? 0;
      }
      if (profile.codeExpiresAt) {
        const diff = Math.floor((profile.codeExpiresAt - Date.now()) / 1000);
        return diff > 0 ? diff : 0;
      }
      return null;
    };

    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      setTimeLeft(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.codeExpiresAt, profile?.codeTimerPaused, profile?.codeTimerPausedRemaining]);

  const isExpired = timeLeft !== null && timeLeft <= 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="bg-[#0d0d12] border border-[#ffd700]/30 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-2xl flex items-center justify-center text-[#ffd700] shrink-0">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">Banking Verification Pipeline</h1>
            <p className="text-xs text-gray-400 font-medium">Multi-tier security verification for PNG ledger clearance and funds authorization</p>
          </div>
        </div>
        <Link 
          to="/dashboard/support"
          className="px-5 py-3 bg-[#1a1a24] border border-[#333] hover:border-[#ffd700] text-white hover:text-[#ffd700] rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0"
        >
          <MessageSquare size={16} /> Request New Codes
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Banking Security Code Card */}
        <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={16} className="text-[#00ff66]" /> Banking Security Code
              </span>
              <span className="text-[10px] font-black text-gray-500 bg-black px-2.5 py-1 rounded border border-[#222]">
                LEVEL 1 CLEARANCE
              </span>
            </div>

            <div className="p-6 bg-black border border-[#1a1a24] rounded-xl text-center space-y-3 relative overflow-hidden">
              {profile?.bankingCode ? (
                isExpired ? (
                  <div className="py-2 space-y-2">
                    <div className="text-red-500 font-black text-lg tracking-widest uppercase flex items-center justify-center gap-2">
                      <ShieldAlert size={20} /> Code Expired
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Please contact support for renewal</p>
                  </div>
                ) : (
                  <div className="text-3xl font-black text-[#00ff66] tracking-[0.3em]">
                    {profile.bankingCode}
                  </div>
                )
              ) : (
                <div className="text-sm font-bold text-gray-600 uppercase italic py-2">
                  No Banking Code Assigned
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a1a24] text-[11px] text-gray-400 font-medium flex justify-between items-center">
            <span>Status</span>
            <span className={profile?.bankingCode ? (isExpired ? "text-red-500 font-bold" : "text-[#00ff66] font-bold") : "text-gray-500"}>
              {profile?.bankingCode ? (isExpired ? "EXPIRED" : "ACTIVE") : "PENDING AUTHORIZATION"}
            </span>
          </div>
        </div>

        {/* Withdrawal Security Code Card */}
        <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <KeyRound size={16} className="text-[#ffd700]" /> Withdrawal Code
              </span>
              <span className="text-[10px] font-black text-gray-500 bg-black px-2.5 py-1 rounded border border-[#222]">
                LEVEL 2 CLEARANCE
              </span>
            </div>

            <div className="p-6 bg-black border border-[#1a1a24] rounded-xl text-center space-y-3 relative overflow-hidden">
              {profile?.withdrawalCode ? (
                isExpired ? (
                  <div className="py-2 space-y-2">
                    <div className="text-red-500 font-black text-lg tracking-widest uppercase flex items-center justify-center gap-2">
                      <ShieldAlert size={20} /> Code Expired
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Please contact support for renewal</p>
                  </div>
                ) : (
                  <div className="text-3xl font-black text-[#ffd700] tracking-[0.3em]">
                    {profile.withdrawalCode}
                  </div>
                )
              ) : (
                <div className="text-sm font-bold text-gray-600 uppercase italic py-2">
                  No Withdrawal Code Assigned
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a1a24] text-[11px] text-gray-400 font-medium flex justify-between items-center">
            <span>Status</span>
            <span className={profile?.withdrawalCode ? (isExpired ? "text-red-500 font-bold" : "text-[#ffd700] font-bold") : "text-gray-500"}>
              {profile?.withdrawalCode ? (isExpired ? "EXPIRED" : "ACTIVE") : "PENDING AUTHORIZATION"}
            </span>
          </div>
        </div>
      </div>

      {/* DYNAMIC CODE TIMER BANNER */}
      {(profile?.bankingCode || profile?.withdrawalCode) && (
        <div className={`p-6 border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
          isExpired 
            ? "bg-red-500/10 border-red-500/50 text-red-500" 
            : "bg-[#ffd700]/10 border-[#ffd700]/30 text-[#ffd700]"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
              isExpired ? "bg-red-500 text-black" : "bg-[#ffd700] text-black"
            }`}>
              <Clock size={24} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider">
                {isExpired ? "Security Credentials Expired" : "Security Code Validity Countdown"}
              </div>
              <div className="text-[11px] text-gray-400 font-medium">
                {isExpired 
                  ? "Security codes have exceeded their validity window. Please contact support to issue new clearance keys."
                  : profile?.codeTimerPaused 
                    ? "Countdown paused by security admin."
                    : "Codes will auto-expire when countdown reaches zero for security compliance."}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            {timeLeft !== null && !isExpired && (
              <div className="text-3xl font-black font-mono tracking-widest text-[#ffd700]">
                {formatTime(timeLeft)}
              </div>
            )}
            {isExpired && (
              <div className="px-4 py-2 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-lg">
                Code Expired - Contact Support
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
