import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ShieldAlert, 
  Users, 
  Clock, 
  MessageSquare, 
  Activity, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Eye,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "../../lib/utils";
import { mockDb } from "../../lib/mockDb";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { icon: Users, label: "Master Registry", path: "/admin/dashboard", sectionId: "registry" },
  { icon: ShieldAlert, label: "Pending Authorizations", path: "/admin/dashboard", sectionId: "authorizations" },
  { icon: Clock, label: "Security Code Timers", path: "/admin/dashboard", sectionId: "timers" },
  { icon: MessageSquare, label: "Live Support Console", path: "/admin/dashboard", sectionId: "support" },
  { icon: Activity, label: "System Audit Logs", path: "/admin/dashboard", sectionId: "audit" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const mirrorAdminSession = mockDb.getMirrorSession();

  const handleExitMirrorMode = () => {
    if (mirrorAdminSession) {
      mockDb.setCurrentSession(mirrorAdminSession);
      mockDb.clearMirrorSession();
      navigate("/admin/dashboard");
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    mockDb.logout();
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore firebase signout errors if network disconnected
    }
    navigate("/login");
  };

  const rawEmail = (user?.email || profile?.email || "").toLowerCase();
  const isLegacyAdmin = !rawEmail || rawEmail === "admin@marketdigitaltrading.com" || rawEmail === "bitcointrading648@gmail.com" || profile?.role === "admin";
  const currentEmail = isLegacyAdmin ? "termtransfer@gmail.com" : rawEmail;

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col font-sans selection:bg-[#ffd700] selection:text-black">
      {/* Top Banner for Mirror Mode if Active */}
      {mirrorAdminSession && (
        <div className="bg-gradient-to-r from-[#ffd700] via-[#ffb700] to-[#ffd700] text-black px-6 py-2.5 flex items-center justify-between font-black text-xs uppercase tracking-wider shadow-xl z-50 sticky top-0">
          <div className="flex items-center gap-3">
            <Eye size={18} className="animate-pulse" />
            <span>MIRROR MODE ACTIVE: Viewing user workspace as <strong className="underline">{profile?.firstName} {profile?.lastName}</strong> ({profile?.email})</span>
          </div>
          <button 
            onClick={handleExitMirrorMode}
            className="px-4 py-1.5 bg-black text-[#ffd700] rounded-lg border border-black hover:bg-gray-900 transition-all flex items-center gap-2 text-[10px]"
          >
            Exit Mirror Mode <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-screen">
        {/* ISOLATED ADMIN SIDEBAR */}
        <aside 
          className={cn(
            "bg-[#0a0a0f] border-r border-[#ffd700]/20 flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 shadow-[10px_0_30px_rgba(0,0,0,0.8)]",
            isSidebarOpen ? "w-64" : "w-20"
          )}
        >
          {/* Header Branding */}
          <div className="h-20 border-b border-[#ffd700]/20 flex items-center px-6 justify-between bg-black/40">
            <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center w-full")}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#ffd700] to-[#ffb700] rounded-xl flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(255,215,0,0.3)] shrink-0">
                <Lock size={20} />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="font-black text-sm tracking-tighter text-white uppercase leading-none">
                    OMNI<span className="text-[#ffd700]">VAULT</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#ffd700] tracking-widest uppercase mt-1">
                    Master Console
                  </span>
                </div>
              )}
            </div>
            
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-500 hover:text-[#ffd700] transition-colors p-1 rounded-lg hover:bg-[#1a1a24]"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="py-3 flex justify-center text-gray-500 hover:text-[#ffd700] transition-colors border-b border-[#1a1a24]"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Admin Navigation Controls Only */}
          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
            <div className={cn("px-3 py-2 text-[9px] font-black uppercase text-[#ffd700] tracking-[0.3em]", !isSidebarOpen && "text-center text-[8px]")}>
              {isSidebarOpen ? "GOD MODE CONTROLS" : "GOD"}
            </div>

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all font-bold text-xs group text-left",
                    isActive 
                      ? "bg-gradient-to-r from-[#ffd700]/20 to-transparent border border-[#ffd700]/40 text-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.1)]" 
                      : "text-gray-400 hover:text-white hover:bg-[#121218]"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-[#ffd700]" : "text-gray-500 group-hover:text-[#ffd700]")} />
                  {isSidebarOpen && (
                    <span className="truncate uppercase tracking-wider text-[11px] font-extrabold">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Profile Footer */}
          <div className="p-4 border-t border-[#ffd700]/20 bg-black/60 space-y-3">
            {isSidebarOpen && (
              <div className="p-3 bg-[#0d0d12] border border-[#ffd700]/30 rounded-xl space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#ffd700]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ffd700]">Clearance Level 0</span>
                </div>
                <div className="text-[11px] font-bold text-white truncate">{currentEmail}</div>
                <div className="text-[9px] text-gray-500 font-mono">ID: MASTER-ROOT-01</div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-black uppercase text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all",
                !isSidebarOpen && "justify-center px-0"
              )}
            >
              <LogOut size={18} />
              {isSidebarOpen && <span>Exit Console</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className={cn(
          "flex-1 transition-all duration-300 min-w-0 bg-[#050508] min-h-screen flex flex-col",
          isSidebarOpen ? "ml-64" : "ml-20"
        )}>
          {/* Top Navigation Bar */}
          <header className="h-20 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#ffd700]/20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
                <Terminal size={16} className="text-[#ffd700]" /> Omni-Vault Administrative Console
              </h1>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                Sovereign Liquidity Ledger & Account Authorization
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-full text-[10px] font-black uppercase text-[#ffd700] tracking-widest">
                <Zap size={14} className="animate-pulse" /> Live Root Session
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffd700] to-[#ffb700] flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                MA
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
