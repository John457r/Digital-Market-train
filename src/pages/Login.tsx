import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { mockDb } from "../lib/mockDb";
import { TrendingUp, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Single Master Admin Authorization Override
      if (cleanEmail === "termtransfer@gmail.com" && (cleanPassword === "AdminPassword123!" || cleanPassword.toLowerCase() === "adminpassword123!")) {
        const masterAdminProfile = {
          uid: "master-admin-root-01",
          email: "termtransfer@gmail.com",
          firstName: "Master",
          lastName: "Admin",
          role: "admin",
          status: "Active",
          balance: 1000000,
          totalProfit: 50000,
          country: "Papua New Guinea",
          phone: "+675 7000 0000",
          city: "Port Moresby",
          onboarded: true,
          securityPin: "1234"
        };

        mockDb.logout();
        mockDb.setCurrentSession(masterAdminProfile);
        mockDb.saveUser(masterAdminProfile as any);

        signInWithEmailAndPassword(auth, "termtransfer@gmail.com", "AdminPassword123!").catch(() => {});

        window.location.href = "/admin/dashboard";
        return;
      }

      // Standard User and Secondary Accounts Authentication
      let firebaseUser = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        firebaseUser = userCredential.user;
      } catch (fbErr: any) {
        // Fallback check in mock database for offline / network resilience
        const mockUsers = mockDb.getUsers();
        const found = mockUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (found) {
          mockDb.setCurrentSession(found);
          const isMasterOrAdmin = found.role === "admin" || cleanEmail === "termtransfer@gmail.com";
          window.location.href = isMasterOrAdmin ? "/admin/dashboard" : "/dashboard";
          return;
        }
        throw fbErr;
      }

      if (firebaseUser) {
        let isAdminUser = (cleanEmail === "termtransfer@gmail.com");
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            isAdminUser = true;
          }
        } catch (docErr) {
          const found = mockDb.getUser(firebaseUser.uid);
          if (found && found.role === "admin") isAdminUser = true;
        }

        mockDb.setCurrentSession({ uid: firebaseUser.uid, email: cleanEmail, role: isAdminUser ? "admin" : "user" });

        if (isAdminUser) {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-[#00ff66] selection:text-black">
      <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-[#00ff66] flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold tracking-tighter mb-4">
            <div className="w-10 h-10 bg-[#00ff66] rounded flex items-center justify-center text-black">
              <TrendingUp size={24} />
            </div>
            Market <span className="text-[#ffd700]">Digital</span>
          </Link>
          <h2 className="text-xl text-gray-400 font-medium tracking-wide">SECURE USER ACCESS</h2>
        </div>

        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff66] to-[#ffd700]"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-3">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00ff66] transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00ff66] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="accent-[#00ff66] bg-black border-[#333]" />
                Remember me
              </label>
              <a href="#" className="text-[#00ff66] hover:underline underline-offset-4">Forgot Password?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#00ff66] text-black font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Authenticating..." : "Sign In to Trading"}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-gray-500">
            Internal PNG Portal. New trader? {" "}
            <Link to="/register" className="text-[#ffd700] hover:underline underline-offset-4 font-bold uppercase tracking-wider text-xs">Create Account</Link>
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-tighter uppercase grayscale">
            <Lock size={12} /> 256-Bit SSL
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-tighter uppercase grayscale">
             ISO Certified
          </div>
        </div>
      </motion.div>
    </div>
  );
}
