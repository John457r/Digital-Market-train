import React from "react";
import { MessageCircle, CreditCard, Hash, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Deposit() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Capital Injection Interface</h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto italic font-medium uppercase tracking-widest leading-relaxed">
          "All funding operations are manually validated and authorized by our Papua New Guinea compliance desk."
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Method */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-10 rounded-2xl flex flex-col items-center text-center group hover:border-[#00ff66] transition-all">
          <div className="w-20 h-20 bg-[#00ff66]/10 rounded-full flex items-center justify-center mb-8 border border-[#00ff66]/20 group-hover:scale-110 transition-transform">
            <MessageCircle className="text-[#00ff66]" size={40} />
          </div>
          <h3 className="text-xl font-black text-white uppercase mb-4 tracking-widest underline decoration-[#00ff66] underline-offset-8">Direct Support Sync</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-10 uppercase tracking-tight">
            Chat with an assigned market agent to receive the official banking details or crypto wallet address for your region. 
          </p>
          <button 
            onClick={() => navigate("/dashboard/support")}
            className="w-full py-5 bg-[#00ff66] text-black font-black uppercase tracking-[0.2em] rounded-lg shadow-[0_10px_30px_rgba(0,255,102,0.2)] flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
          >
            START DEPOSIT CHAT <ArrowRight size={20} />
          </button>
        </div>

        {/* Security Info */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-10 rounded-2xl flex flex-col">
          <h4 className="text-xs font-black text-[#ffd700] uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
            <ShieldCheck size={16} /> Compliance Protocol
          </h4>
          
          <div className="space-y-8 flex-1">
             <div className="flex gap-6">
                <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 text-gray-400 font-black italic">01</div>
                <div>
                   <h5 className="text-sm font-black text-white uppercase mb-1">Identity Verification</h5>
                   <p className="text-xs text-gray-500 uppercase tracking-tight">Ensure your registration details match your bank account name to avoid processing delays.</p>
                </div>
             </div>
             <div className="flex gap-6">
                <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 text-gray-400 font-black italic">02</div>
                <div>
                   <h5 className="text-sm font-black text-white uppercase mb-1">Receipt Submission</h5>
                   <p className="text-xs text-gray-500 uppercase tracking-tight">After transfer, capture a clear image of the transaction receipt and send it directly in the live support chat.</p>
                </div>
             </div>
             <div className="flex gap-6">
                <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center shrink-0 text-gray-400 font-black italic">03</div>
                <div>
                   <h5 className="text-sm font-black text-white uppercase mb-1">Balance Update</h5>
                   <p className="text-xs text-gray-500 uppercase tracking-tight">Once verified, your dashboard equity will reflect the new balance within <span className="text-[#00ff66]">60 minutes</span>.</p>
                </div>
             </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex items-center justify-between opacity-50">
             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
               <Clock size={12} /> Manual Auth Active
             </div>
             <div className="flex items-center gap-1 h-3">
                <div className="w-1.5 h-full bg-[#00ff66]"></div>
                <div className="w-1.5 h-1/2 bg-[#333]"></div>
                <div className="w-1.5 h-3/4 bg-[#333]"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Warning Grid */}
      <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-6 text-center md:text-left">
           <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <Hash className="text-red-500" size={32} />
           </div>
           <div>
              <h4 className="text-sm font-black text-red-500 uppercase tracking-widest mb-1 font-sans">Official Channel Warning</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest max-w-md font-medium">Only use the payment details provided within this official portal chat. Market Digital Trading agents will never contact you on external apps like WhatsApp or Telegram for deposits.</p>
           </div>
        </div>
        <div className="text-[10px] font-black p-2 border border-red-500/30 text-red-500 rounded uppercase">CRITICAL SECURITY</div>
      </div>
    </div>
  );
}
