import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { db } from "../../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { mockDb } from "../../lib/mockDb";
import { Send, MessageCircle, Clock, ShieldCheck, User as UserIcon } from "lucide-react";
import { ChatMessage } from "../../types";
import { cn } from "../../lib/utils";

export default function Support() {
  const { profile, user, isMock } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState(location.state?.initialMessage || "");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.uid) return;

    if (isMock) {
      setMessages(mockDb.getChatMessages(profile.uid));
      return;
    }

    const q = query(
      collection(db, `chats/${profile.uid}/messages`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (err) => {
      console.error("Chat listen error, using mock:", err);
      setMessages(mockDb.getChatMessages(profile.uid));
    });

    return () => unsubscribe();
  }, [profile?.uid, isMock]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;

    const msgData: any = {
      userId: profile.uid,
      senderId: profile.uid,
      text: newMessage,
      isAdmin: false,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, `chats/${profile.uid}/messages`), {
        ...msgData,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Chat send error, saving to mock:", err);
    }
    
    mockDb.saveChatMessage(profile.uid, msgData);
    if (isMock) {
      setMessages(mockDb.getChatMessages(profile.uid));
    }
    
    setNewMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Support Header */}
      <div className="p-6 border-b border-[#1a1a1a] bg-black/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-[#00ff66]/10 rounded-full flex items-center justify-center border border-[#00ff66]/20">
            <MessageCircle className="text-[#00ff66]" size={24} />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Digital Support Desk</h3>
              <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></div>
                Admin Assigned // Port Moresby Office
              </p>
           </div>
        </div>
        <div className="hidden sm:block text-[9px] text-[#ffd700] border border-[#ffd700]/30 px-3 py-1 rounded uppercase font-black tracking-tighter">
          SECURE CHANNEL 256-AES
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto">
             <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="text-gray-700" size={40} />
             </div>
             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Initialized New Session</h4>
             <p className="text-[10px] text-gray-600 uppercase leading-loose">"All deposits, withdrawals, and ledger adjustments are coordinated here. How can we assist with your portfolio today?"</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex flex-col", msg.isAdmin ? "items-start" : "items-end")}>
               <div className={cn(
                 "max-w-[80%] p-4 rounded-2xl text-sm relative",
                 msg.isAdmin 
                  ? "bg-[#1a1a1a] text-gray-300 rounded-tl-none border-l-2 border-[#ffd700]" 
                  : "bg-[#00ff66] text-black font-medium rounded-tr-none shadow-[0_4px_15px_rgba(0,255,102,0.1)]"
               )}>
                  {msg.text}
                  <div className={cn("text-[8px] uppercase mt-2 opacity-50 font-bold", msg.isAdmin ? "text-gray-500" : "text-black")}>
                    {msg.isAdmin ? "ADMINISTRATOR" : "TRADER"} // {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString() : "PENDING"}
                  </div>
               </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-black/50 border-t border-[#1a1a1a]">
        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your secure message..."
            className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pl-6 pr-16 text-sm text-white focus:border-[#00ff66] outline-none transition-all placeholder:text-gray-700"
          />
          <button 
             type="submit"
             disabled={!newMessage.trim()}
             className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#00ff66] text-black rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
           <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase"><Clock size={10} /> 24/7 Coverage</div>
           <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase"><UserIcon size={10} /> Local PNG Support</div>
        </div>
      </div>
    </div>
  );
}
