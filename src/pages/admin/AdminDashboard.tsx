import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  query, 
  doc, 
  updateDoc, 
  onSnapshot, 
  orderBy,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { mockDb } from "../../lib/mockDb";
import { 
  Users, 
  Search, 
  Edit3, 
  ShieldAlert, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  MessageCircle,
  Hash,
  X,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingDown,
  Plus,
  Minus,
  Snowflake,
  Eye,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Zap
} from "lucide-react";
import { UserProfile, Transaction, ChatMessage } from "../../types";
import { formatCurrency, cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function AdminDashboard() {
  const { profile, isMock } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Ledger Editing State
  const [ledgerEdit, setLedgerEdit] = useState({ balance: 0, totalProfit: 0, status: "Active" });
  const [codeEdit, setCodeEdit] = useState({ bankingCode: "", withdrawalCode: "" });
  
  // Quick Balance Input State
  const [quickBalanceInputs, setQuickBalanceInputs] = useState<{ [uid: string]: string }>({});

  // Code Timer Modal / Settings State
  const [timerModalUser, setTimerModalUser] = useState<UserProfile | null>(null);
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(15);

  // Chat State
  const [adminChatOpen, setAdminChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (isMock) {
      setUsers(mockDb.getUsers());
      setTransactions(mockDb.getTransactions());
      setLoading(false);
      return;
    }

    const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
      setLoading(false);
    }, (err) => {
      console.warn("User list listen error, using mock:", err);
      setUsers(mockDb.getUsers());
      setLoading(false);
    });

    const qTxs = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsubTxs = onSnapshot(qTxs, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (err) => {
      console.warn("Tx list listen error, using mock:", err);
      setTransactions(mockDb.getTransactions());
    });

    return () => {
      unsubUsers();
      unsubTxs();
    };
  }, [isMock]);

  useEffect(() => {
    if (!chatUser) return;
    
    if (isMock) {
      setMessages(mockDb.getChatMessages(chatUser.uid));
      return;
    }

    const q = query(collection(db, `chats/${chatUser.uid}/messages`), orderBy("createdAt", "asc"));
    const unsubChat = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    }, (err) => {
      console.warn("Admin chat listen error, using mock:", err);
      setMessages(mockDb.getChatMessages(chatUser.uid));
    });
    return () => unsubChat();
  }, [chatUser?.uid, isMock]);

  // God Mode: Direct Add/Deduct Balance
  const handleQuickBalanceUpdate = async (u: UserProfile, type: "add" | "deduct") => {
    const rawVal = quickBalanceInputs[u.uid];
    const amount = parseFloat(rawVal || "0");
    if (isNaN(amount) || amount <= 0) return;

    const currentBal = u.balance || 0;
    const newBal = type === "add" ? currentBal + amount : Math.max(0, currentBal - amount);

    const updateData = { balance: newBal };

    try {
      await updateDoc(doc(db, "users", u.uid), updateData);
    } catch (err) {
      console.error("Quick balance update error:", err);
    }

    const updatedUser = { ...u, balance: newBal };
    mockDb.saveUser(updatedUser);
    if (isMock) setUsers(mockDb.getUsers());

    setQuickBalanceInputs(prev => ({ ...prev, [u.uid]: "" }));
  };

  // God Mode: Toggle Freeze / Restrict Account
  const handleToggleFreeze = async (u: UserProfile) => {
    const newStatus = u.status === "Restricted" ? "Active" : "Restricted";
    const updateData = { status: newStatus };

    try {
      await updateDoc(doc(db, "users", u.uid), updateData);
    } catch (err) {
      console.error("Freeze toggle error:", err);
    }

    const updatedUser = { ...u, status: newStatus as any };
    mockDb.saveUser(updatedUser);
    if (isMock) setUsers(mockDb.getUsers());
  };

  // God Mode: View As User (Mirror Mode)
  const handleMirrorUser = (u: UserProfile) => {
    if (!profile) return;
    mockDb.setMirrorSession(profile); // Save admin session
    mockDb.setCurrentSession(u); // Switch current session to user
    navigate("/dashboard");
    window.location.reload();
  };

  // Security Code Timer Handlers
  const handleSetCodeTimer = async (u: UserProfile, durationMinutes: number) => {
    const durationSeconds = durationMinutes * 60;
    const expiresAt = Date.now() + durationSeconds * 1000;

    const updateData = {
      codeTimerDuration: durationSeconds,
      codeExpiresAt: expiresAt,
      codeTimerPaused: false,
      codeTimerPausedRemaining: undefined
    };

    try {
      await updateDoc(doc(db, "users", u.uid), updateData);
    } catch (err) {
      console.error("Set code timer error:", err);
    }

    const updatedUser = { ...u, ...updateData };
    mockDb.saveUser(updatedUser);
    if (isMock) setUsers(mockDb.getUsers());
    setTimerModalUser(null);
  };

  const handlePauseResumeTimer = async (u: UserProfile) => {
    let updateData: any = {};

    if (u.codeTimerPaused) {
      // Resume
      const remainingSecs = u.codeTimerPausedRemaining || 0;
      const newExpiresAt = Date.now() + remainingSecs * 1000;
      updateData = {
        codeTimerPaused: false,
        codeExpiresAt: newExpiresAt,
        codeTimerPausedRemaining: undefined
      };
    } else {
      // Pause
      const remainingSecs = Math.max(0, Math.floor(((u.codeExpiresAt || 0) - Date.now()) / 1000));
      updateData = {
        codeTimerPaused: true,
        codeTimerPausedRemaining: remainingSecs
      };
    }

    try {
      await updateDoc(doc(db, "users", u.uid), updateData);
    } catch (err) {
      console.error("Pause/resume timer error:", err);
    }

    const updatedUser = { ...u, ...updateData };
    mockDb.saveUser(updatedUser);
    if (isMock) setUsers(mockDb.getUsers());
  };

  const handleUpdateLedger = async () => {
    if (!selectedUser) return;
    
    const updateData: any = {
      balance: parseFloat(ledgerEdit.balance.toString()),
      totalProfit: parseFloat(ledgerEdit.totalProfit.toString()),
      status: selectedUser.status,
      bankingCode: codeEdit.bankingCode,
      withdrawalCode: codeEdit.withdrawalCode
    };

    try {
      await updateDoc(doc(db, "users", selectedUser.uid), updateData);
    } catch (err) {
      console.error("Admin ledger update error, using mock:", err);
    }
    
    mockDb.saveUser({ ...selectedUser, ...updateData });
    if (isMock) setUsers(mockDb.getUsers());
    
    setSelectedUser(null);
  };

  const handleToggleRequireVerification = async (u: UserProfile) => {
    const newVal = !u.requireVerification;
    const defaultMsg = "Verification required. Please contact Live Support to complete your identity audit before initiating withdrawals.";
    
    const updateData = { 
      requireVerification: newVal,
      verificationMessage: u.verificationMessage || defaultMsg
    };

    try {
      await updateDoc(doc(db, "users", u.uid), updateData);
    } catch (err) {
      console.error("Toggle verification error:", err);
    }

    const updatedUser = { ...u, ...updateData };
    mockDb.saveUser(updatedUser);
    if (isMock) setUsers(mockDb.getUsers());
  };

  const handleUpdateVerificationMsg = async (u: UserProfile, msg: string) => {
    const updateData = { verificationMessage: msg };

    try {
      await updateDoc(doc(db, "users", u.uid), updateData);
    } catch (err) {
      console.error("Update verification message error:", err);
    }

    const updatedUser = { ...u, ...updateData };
    mockDb.saveUser(updatedUser);
    if (isMock) setUsers(mockDb.getUsers());
  };

  const handleApproveTx = async (tx: Transaction, status: "approved" | "rejected") => {
    let rejectionReason = "";
    if (status === "rejected") {
      const promptRes = window.prompt("Enter rejection reason for this withdrawal:", "Incomplete documentation");
      if (promptRes === null) return; // Cancel rejection if prompt dismissed
      rejectionReason = promptRes.trim() || "Transaction rejected by system verification";
    }

    // Refund logic for rejected withdrawals
    if (status === "rejected" && tx.type === "withdrawal") {
      const targetUser = users.find(u => u.uid === tx.userId);
      if (targetUser) {
        const refundedBalance = (targetUser.balance || 0) + tx.amount;
        try {
          await updateDoc(doc(db, "users", targetUser.uid), { balance: refundedBalance });
        } catch (err) {
          console.error("Refund balance error:", err);
        }
        mockDb.saveUser({ ...targetUser, balance: refundedBalance });
      }
    }

    const txUpdateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    if (rejectionReason) {
      txUpdateData.rejectionReason = rejectionReason;
    }

    try {
      await updateDoc(doc(db, "transactions", tx.id), txUpdateData);
    } catch (err) {
      console.error("Admin tx approval error, using mock:", err);
    }
    
    mockDb.updateTransaction(tx.id, status, rejectionReason);
    if (isMock) setTransactions(mockDb.getTransactions());
    if (isMock) setUsers(mockDb.getUsers());
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUser) return;
    
    const msgData: any = {
      userId: chatUser.uid,
      senderId: profile?.uid,
      text: newMessage,
      isAdmin: true,
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, `chats/${chatUser.uid}/messages`), {
        ...msgData,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Admin chat send error, using mock:", err);
    }
    
    mockDb.saveChatMessage(chatUser.uid, msgData);
    if (isMock) setMessages(mockDb.getChatMessages(chatUser.uid));
    
    setNewMessage("");
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Summary Stats Header */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl relative overflow-hidden shadow-xl">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2">Total Managed Liquidity</div>
            <div className="text-3xl font-black text-[#00ff66]">
              {formatCurrency(users.reduce((a, b) => a + (b.balance || 0), 0))}
            </div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">Global PNG Treasury Pool</div>
          </div>

          <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl relative overflow-hidden shadow-xl">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2">Registered Accounts</div>
            <div className="text-3xl font-black text-white">{users.length}</div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">Active Trader Profiles</div>
          </div>

          <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl relative overflow-hidden shadow-xl">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2">Pending Authorizations</div>
            <div className="text-3xl font-black text-[#ffd700]">
              {transactions.filter(t => t.status === "pending").length}
            </div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">Transactions Requiring Action</div>
          </div>

          <div className="p-6 bg-[#0d0d12] border border-[#1a1a24] rounded-2xl relative overflow-hidden shadow-xl">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2">System Clearance Level</div>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#00ff66]">
              LEVEL 0 (FULL)
            </div>
            <div className="text-[10px] text-gray-500 font-medium mt-1">Bypass Network Protocols</div>
          </div>
        </div>

        {/* User Registry with God Mode Inline Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                <h3 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-3">
                  <Users className="text-[#ffd700]" size={24} /> God Mode Digital Registry
                </h3>
                <p className="text-xs text-gray-400 font-medium">Direct balance controls, instant account freezes, 1-click chat, and user mirroring</p>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search by email or name..."
                 className="bg-[#0d0d12] border border-[#1a1a24] rounded-xl py-3 pl-10 pr-4 text-xs focus:border-[#ffd700] outline-none w-72 text-white"
               />
             </div>
          </div>

          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-2xl overflow-hidden shadow-2xl">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                 <thead>
                   <tr className="bg-black/60 border-b border-[#1a1a24] text-gray-400 uppercase tracking-wider font-extrabold">
                     <th className="p-4">Trader Details</th>
                     <th className="p-4">Status</th>
                     <th className="p-4">Current Balance</th>
                     <th className="p-4">Verification Audit</th>
                     <th className="p-4">Quick Balance Control</th>
                     <th className="p-4">Security Code Timer</th>
                     <th className="p-4 text-center">God Mode Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1a1a24]">
                   {filteredUsers.map((u, i) => (
                     <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a1a24] to-[#0d0d12] flex items-center justify-center text-[#ffd700] font-black border border-[#1a1a24] group-hover:border-[#ffd700]/40 shrink-0">
                             {u.firstName[0]}
                            </div>
                            <div>
                               <div className="font-bold text-white text-sm">{u.firstName} {u.lastName}</div>
                               <div className="text-[10px] text-gray-400 font-mono">{u.email}</div>
                            </div>
                         </div>
                       </td>

                       <td className="p-4">
                         <span className={cn(
                           "px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest",
                           u.status === "Active" ? "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30" : 
                           u.status === "Pending" ? "bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/30" :
                           "bg-red-500/10 text-red-500 border-red-500/30"
                         )}>
                           {u.status}
                         </span>
                       </td>

                       <td className="p-4 font-black text-white text-sm">
                         {formatCurrency(u.balance || 0)}
                       </td>

                       {/* God Mode: Require Verification Toggle & Custom Message */}
                       <td className="p-4">
                         <div className="flex flex-col gap-2 min-w-[200px]">
                           <button 
                             onClick={() => handleToggleRequireVerification(u)}
                             className={cn(
                               "px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition-all text-left flex items-center justify-between",
                               u.requireVerification 
                                 ? "bg-red-500/20 text-red-400 border-red-500/50" 
                                 : "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30"
                             )}
                           >
                             <span>{u.requireVerification ? "Verification Required" : "Verified Clear"}</span>
                             <span className="font-bold">{u.requireVerification ? "LOCKED" : "PASS"}</span>
                           </button>
                           {u.requireVerification && (
                             <input 
                               type="text" 
                               placeholder="Support message for user..."
                               defaultValue={u.verificationMessage || "Verification required. Please contact Live Support to complete your identity audit before initiating withdrawals."}
                               onBlur={(e) => handleUpdateVerificationMsg(u, e.target.value)}
                               className="bg-black border border-[#222] rounded-lg py-1 px-2 text-[10px] text-gray-300 focus:border-[#ffd700] outline-none"
                             />
                           )}
                         </div>
                       </td>

                       {/* God Mode: Inline Balance Control */}
                       <td className="p-4">
                         <div className="flex items-center gap-2">
                           <input 
                             type="number"
                             placeholder="Amount"
                             value={quickBalanceInputs[u.uid] || ""}
                             onChange={(e) => setQuickBalanceInputs({ ...quickBalanceInputs, [u.uid]: e.target.value })}
                             className="w-24 bg-black border border-[#222] rounded-lg py-1.5 px-2 text-xs text-white focus:border-[#00ff66] outline-none font-mono"
                           />
                           <button 
                             onClick={() => handleQuickBalanceUpdate(u, "add")}
                             title="Add Balance"
                             className="p-1.5 bg-[#00ff66]/10 border border-[#00ff66]/30 hover:bg-[#00ff66] hover:text-black text-[#00ff66] rounded-lg transition-all"
                           >
                             <Plus size={14} />
                           </button>
                           <button 
                             onClick={() => handleQuickBalanceUpdate(u, "deduct")}
                             title="Deduct Balance"
                             className="p-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all"
                           >
                             <Minus size={14} />
                           </button>
                         </div>
                       </td>

                       {/* Security Code Timer Status */}
                       <td className="p-4">
                          <div className="flex items-center gap-2">
                            {u.codeTimerDuration ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#ffd700] bg-[#ffd700]/10 px-2 py-1 rounded border border-[#ffd700]/30">
                                  {u.codeTimerPaused ? "PAUSED" : `${Math.max(0, Math.floor(((u.codeExpiresAt || 0) - Date.now()) / 1000))}s`}
                                </span>
                                <button 
                                  onClick={() => handlePauseResumeTimer(u)}
                                  className="p-1 bg-[#1a1a24] hover:bg-[#333] text-gray-300 rounded transition-all"
                                  title={u.codeTimerPaused ? "Resume Timer" : "Pause Timer"}
                                >
                                  {u.codeTimerPaused ? <Play size={12} /> : <Pause size={12} />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic">No Active Timer</span>
                            )}
                            <button 
                              onClick={() => setTimerModalUser(u)}
                              className="p-1.5 bg-[#1a1a24] hover:bg-[#ffd700] hover:text-black text-gray-400 rounded-lg transition-all"
                              title="Configure Code Timer"
                            >
                              <Clock size={14} />
                            </button>
                          </div>
                       </td>

                       {/* God Mode: Action Buttons */}
                       <td className="p-4">
                         <div className="flex items-center justify-center gap-2">
                            {/* Freeze Account Toggle */}
                            <button 
                              onClick={() => handleToggleFreeze(u)}
                              title={u.status === "Restricted" ? "Unfreeze Account" : "Freeze Account"}
                              className={cn(
                                "p-2 rounded-lg border transition-all",
                                u.status === "Restricted" 
                                  ? "bg-red-500/20 text-red-500 border-red-500/40 hover:bg-red-500 hover:text-white" 
                                  : "bg-[#1a1a24] text-gray-400 border-[#222] hover:border-red-500 hover:text-red-500"
                              )}
                            >
                              <Snowflake size={16} />
                            </button>

                            {/* 1-Click Support Chat */}
                            <button 
                              onClick={() => {
                                setChatUser(u);
                                setAdminChatOpen(true);
                              }}
                              title="Open 1-Click Support Chat"
                              className="p-2 bg-[#1a1a24] border border-[#222] hover:border-[#00ff66] hover:text-[#00ff66] text-gray-400 rounded-lg transition-all"
                            >
                              <MessageCircle size={16} />
                            </button>

                            {/* View as User Mirror Mode */}
                            <button 
                              onClick={() => handleMirrorUser(u)}
                              title="View as User (Mirror Mode)"
                              className="p-2 bg-[#1a1a24] border border-[#222] hover:border-[#ffd700] hover:text-[#ffd700] text-gray-400 rounded-lg transition-all"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Detailed Edit Modal */}
                            <button 
                              onClick={() => {
                                setSelectedUser(u);
                                setLedgerEdit({ balance: u.balance, totalProfit: u.totalProfit, status: u.status });
                                setCodeEdit({ bankingCode: u.bankingCode || "", withdrawalCode: u.withdrawalCode || "" });
                              }}
                              title="Edit Full Ledger"
                              className="p-2 bg-[#1a1a24] border border-[#222] hover:border-white hover:text-white text-gray-400 rounded-lg transition-all"
                            >
                             <Edit3 size={16} />
                            </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Pending Transactions Section */}
        <div className="space-y-6 pt-6">
          <h3 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={24} /> Pending Authorizations Pipeline
          </h3>
          <div className="bg-[#0d0d12] border border-[#1a1a24] rounded-2xl overflow-hidden shadow-2xl">
             <div className="divide-y divide-[#1a1a24]">
                {transactions.filter(t => t.status === "pending").length === 0 ? (
                  <div className="p-12 text-center text-gray-500 text-xs italic uppercase tracking-widest">
                    Zero pending authorization requests in queue
                  </div>
                ) : (
                  transactions.filter(t => t.status === "pending").map((tx, i) => (
                    <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={cn("p-3 rounded-xl border shrink-0", tx.type === "deposit" ? "bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/30" : "bg-red-500/10 text-red-500 border-red-500/30")}>
                             {tx.type === "deposit" ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                          </div>
                          <div>
                             <div className="font-black text-white uppercase text-sm">{tx.userName} // {tx.type}</div>
                             <div className="text-xs font-black text-[#ffd700] mt-0.5">{formatCurrency(tx.amount)}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                          <button 
                            onClick={() => handleApproveTx(tx, "approved")}
                            className="px-6 py-2.5 bg-[#00ff66] text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#00e65c] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all"
                          >
                            AUTHORIZE
                          </button>
                          <button 
                            onClick={() => handleApproveTx(tx, "rejected")}
                            className="px-6 py-2.5 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl border border-red-500/30 hover:bg-red-500 hover:text-white transition-all"
                          >
                            REJECT
                          </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

      {/* Code Timer Modal */}
      <AnimatePresence>
        {timerModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setTimerModalUser(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-[#0d0d12] border border-[#ffd700]/30 rounded-2xl p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#1a1a24] pb-4">
                <div className="flex items-center gap-3">
                  <Clock className="text-[#ffd700]" size={24} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Security Code Expiry Timer</h3>
                    <p className="text-[10px] text-gray-500 font-medium">{timerModalUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setTimerModalUser(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Set Countdown Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 15, 30, 60, 120, 1440].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setTimerDurationMinutes(mins)}
                      className={cn(
                        "py-3 border rounded-xl text-xs font-black uppercase transition-all",
                        timerDurationMinutes === mins 
                          ? "bg-[#ffd700] text-black border-[#ffd700]" 
                          : "bg-black text-gray-400 border-[#222] hover:border-[#ffd700]/50"
                      )}
                    >
                      {mins < 60 ? `${mins} Mins` : `${mins / 60} Hrs`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSetCodeTimer(timerModalUser, timerDurationMinutes)}
                className="w-full py-4 bg-[#ffd700] text-black font-black uppercase text-xs tracking-wider rounded-xl hover:shadow-[0_0_25px_rgba(255,215,0,0.3)] transition-all"
              >
                Start Countdown Timer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Ledger Editor Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedUser(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-[#0d0d12] border border-[#ffd700]/40 rounded-2xl p-10 shadow-2xl space-y-8">
                <div className="flex items-center justify-between border-b border-[#1a1a24] pb-6">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Ledger Architect</h2>
                      <p className="text-[10px] text-[#ffd700] font-black uppercase tracking-[0.4em]">Trader: {selectedUser.email}</p>
                   </div>
                   <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust Balance (Kina)</label>
                        <input 
                          type="number" 
                          value={ledgerEdit.balance} 
                          onChange={(e) => setLedgerEdit({ ...ledgerEdit, balance: parseFloat(e.target.value) })}
                          className="w-full bg-black border border-[#222] rounded-xl py-3 px-4 text-white focus:border-[#ffd700] outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust Total Profit (Kina)</label>
                        <input 
                          type="number" 
                          value={ledgerEdit.totalProfit} 
                          onChange={(e) => setLedgerEdit({ ...ledgerEdit, totalProfit: parseFloat(e.target.value) })}
                          className="w-full bg-black border border-[#222] rounded-xl py-3 px-4 text-white focus:border-[#ffd700] outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-[#00ff66] uppercase tracking-widest">Generate Banking Code</label>
                         <input 
                           type="text" 
                           value={codeEdit.bankingCode} 
                           placeholder="B-XXXXXX"
                           onChange={(e) => setCodeEdit({ ...codeEdit, bankingCode: e.target.value.toUpperCase() })}
                           className="w-full bg-black border border-[#222] rounded-xl py-3 px-4 text-white focus:border-[#00ff66] outline-none font-mono"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest">Generate Withdrawal Code</label>
                         <input 
                           type="text" 
                           value={codeEdit.withdrawalCode} 
                           placeholder="W-XXXXXX"
                           onChange={(e) => setCodeEdit({ ...codeEdit, withdrawalCode: e.target.value.toUpperCase() })}
                           className="w-full bg-black border border-[#222] rounded-xl py-3 px-4 text-white focus:border-[#ffd700] outline-none font-mono"
                         />
                      </div>
                   </div>

                   <button 
                     onClick={handleUpdateLedger}
                     className="w-full py-4 bg-[#ffd700] text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:bg-[#ffe066] transition-all text-xs"
                   >
                     COMMIT DIRECTIVE TO LEDGER
                   </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating 1-Click Support Chat Panel */}
      <AnimatePresence>
        {adminChatOpen && chatUser && (
          <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 20, opacity: 0 }}
             className="fixed bottom-10 right-10 w-[420px] h-[580px] bg-[#0d0d12] border border-[#ffd700]/40 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden"
          >
             <div className="p-4 bg-black border-b border-[#1a1a24] flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-xl bg-[#1a1a24] border border-[#ffd700]/40 flex items-center justify-center font-bold text-xs text-[#ffd700]">
                    {chatUser.firstName[0]}
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-white leading-tight">
                      Support Direct Line <br />
                      <span className="text-[#ffd700] font-bold text-[9px]">{chatUser.email}</span>
                   </div>
                </div>
                <button onClick={() => setAdminChatOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex flex-col", m.isAdmin ? "items-end" : "items-start")}>
                     <div className={cn("max-w-[85%] p-3.5 rounded-2xl text-xs font-medium", m.isAdmin ? "bg-[#ffd700] text-black font-bold rounded-tr-none" : "bg-[#1a1a24] text-white rounded-tl-none")}>
                        {m.text}
                     </div>
                  </div>
                ))}
             </div>

             <div className="p-4 bg-black border-t border-[#1a1a24]">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                   <input 
                     type="text" 
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                     className="flex-1 bg-[#111] border border-[#222] rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#ffd700] outline-none"
                     placeholder="Type admin response..."
                   />
                   <button type="submit" className="bg-[#ffd700] text-black px-5 rounded-xl font-black uppercase text-xs hover:bg-[#ffe066] transition-all">SEND</button>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
