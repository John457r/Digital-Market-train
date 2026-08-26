import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  LineChart, 
  PlusCircle, 
  ArrowDownCircle, 
  Bell, 
  ShieldCheck, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Award,
  Eye,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "../../lib/utils";
import { mockDb } from "../../lib/mockDb";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Award, label: "Investment Plans", path: "/dashboard/plans" },
  { icon: LineChart, label: "Live Trading", path: "/dashboard/trading" },
  { icon: PlusCircle, label: "Deposit", path: "/dashboard/deposit" },
  { icon: ArrowDownCircle, label: "Withdraw", path: "/dashboard/withdraw" },
  { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
  { icon: ShieldCheck, label: "Banking Verification", path: "/dashboard/verification" },
  { icon: MessageSquare, label: "Live Support", path: "/dashboard/support" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#800000] text-slate-900 font-sans flex flex-col relative overflow-x-hidden">
      {/* Sidebar Backdrop Overlay when open */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Collapsible Slide-over Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#5c0000] border-r border-[#800000] transition-transform duration-300 ease-in-out flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#800000] shrink-0 bg-[#4a0000]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffd700] rounded-xl flex items-center justify-center text-black shrink-0 shadow-md">
              <TrendingUp size={22} className="text-[#800000]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">
                KINA <span className="text-[#ffd700]">BANK</span>
              </span>
              <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">Digital Banking</span>
            </div>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 rounded-full bg-[#800000] text-white flex items-center justify-center hover:bg-[#990000] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group border border-transparent font-bold text-sm",
                  isActive 
                    ? "bg-[#ffd700] text-black shadow-md font-black" 
                    : "text-gray-200 hover:bg-[#800000]/60 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", isActive ? "text-black" : "text-[#ffd700]")} />
                <span className="uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#800000] bg-[#4a0000] space-y-2">
          {profile?.role === "admin" && (
            <Link 
              to="/admin/dashboard" 
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#ffd700] text-black font-black text-xs uppercase tracking-wider hover:bg-[#ffe066] transition-all shadow-md"
            >
              <ShieldCheck size={18} />
              <span>Admin Portal</span>
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-200 hover:bg-red-950/50 hover:text-white transition-all font-bold text-xs uppercase tracking-wider"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Full-Width Section */}
      <main className="flex-1 w-full min-w-0 bg-[#800000] min-h-screen flex flex-col">
        {mirrorAdminSession && (
          <div className="bg-gradient-to-r from-[#ffd700] via-[#ffe066] to-[#ffd700] text-black px-6 py-2.5 flex items-center justify-between font-black text-xs uppercase tracking-wider shadow-md z-30">
            <div className="flex items-center gap-3">
              <Eye size={18} className="animate-pulse text-[#800000]" />
              <span>MIRROR MODE: Viewing as <strong>{profile?.firstName} {profile?.lastName}</strong> ({profile?.email})</span>
            </div>
            <button 
              onClick={handleExitMirrorMode}
              className="px-4 py-1.5 bg-[#800000] text-white rounded-lg border border-[#800000] hover:bg-[#660000] transition-all flex items-center gap-2 text-[10px]"
            >
              Exit Mirror Mode <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Header: Kina Bank Deep Red with White Text and Yellow Accents */}
        <header className="h-20 bg-[#800000] text-white border-b border-[#990000] flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#ffd700] rounded-xl flex items-center justify-center text-[#800000] font-black shadow-md">
                K
              </div>
              <span className="text-lg font-black tracking-tight hidden sm:inline text-white">
                KINA <span className="text-[#ffd700]">BANK</span>
              </span>
            </Link>
            <div className="h-6 w-[1px] bg-white/20 hidden sm:block mx-2" />
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-black text-white uppercase tracking-wider">
                {navItems.find(i => i.path === location.pathname)?.label || "Digital Portfolio"}
              </h1>
              <span className="text-[10px] text-[#ffd700] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse" />
                Live PNG Terminal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black uppercase text-white tracking-wider">{profile?.firstName} {profile?.lastName}</span>
              <span className="text-[9px] text-black font-extrabold uppercase tracking-widest px-2 py-0.5 bg-[#ffd700] rounded mt-0.5 shadow-sm">
                {profile?.status} ACCOUNT
              </span>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white text-[#800000] border-2 border-[#ffd700] flex items-center justify-center font-black text-lg shadow-md">
              {profile?.firstName?.[0] || "U"}
            </div>

            {/* Circular White Button with Black Hamburger Menu Icon in Top Right */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 border border-gray-200"
              title="Toggle Menu"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Main Dashboard Card Container - Light Pink/Off-White with Rounded Top Corners */}
        <section className="flex-1 bg-[#fdf2f4] rounded-t-3xl shadow-inner p-6 md:p-10 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500 text-slate-900">
          {children}
        </section>
      </main>
    </div>
  );
}
