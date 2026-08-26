import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { mockDb } from "../lib/mockDb";
import { TrendingUp, User, Mail, Phone, Lock, Globe, MapPin, Hash, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Papua New Guinea",
    city: "",
    securityPin: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.securityPin.length < 4) {
      setError("Security PIN must be at least 4 digits.");
      return;
    }

    setLoading(true);

    try {
      // 1. CHECK LOCAL MOCK DB FOR DUPLICATES
      const existingUser = mockDb.getUserByEmail(formData.email);
      if (existingUser) {
        throw new Error("Account already registered. Please go to the Login page.");
      }

      console.log("Starting registration process for:", formData.email);
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        user = userCredential.user;
        console.log("Firebase Auth account created:", user.uid);
      } catch (authErr: any) {
        if (authErr.code === "auth/network-request-failed" || authErr.message?.includes("network")) {
          console.warn("Network error during auth creation, falling back to mock");
          user = { uid: "mock-user-" + Date.now(), email: formData.email };
        } else {
          // If Firebase says email in use, respect that too
          if (authErr.code === "auth/email-already-in-use") {
             throw new Error("Account already registered. Please go to the Login page.");
          }
          throw authErr;
        }
      }

      const isAdminEmail = formData.email.toLowerCase() === "termtransfer@gmail.com";

      const userProfile: any = {
        uid: user.uid,
        email: formData.email.toLowerCase(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        phone: formData.phone,
        city: formData.city,
        status: "Active",
        role: isAdminEmail ? "admin" : "user",
        balance: isAdminEmail ? 1000000 : 0,
        totalProfit: isAdminEmail ? 50000 : 0,
        securityPin: formData.securityPin,
        onboarded: isAdminEmail,
        createdAt: new Date()
      };

      try {
        console.log("Writing user profile to Firestore...");
        await setDoc(doc(db, "users", user.uid), { ...userProfile, createdAt: serverTimestamp() });
        console.log("User profile written successfully.");
      } catch (dbErr: any) {
        console.warn("Database error, saving to mock storage only:", dbErr);
      }
      
      mockDb.saveUser(userProfile);
      mockDb.setCurrentSession(user);
      
      setSuccess(true);
      
      // Delay redirect to show success message
      setTimeout(() => {
        navigate(isAdminEmail ? "/admin/dashboard" : "/dashboard");
      }, 2000);
      
    } catch (err: any) {
      console.error("Registration Error Detailed:", err);
      let errorMessage = err.message || "Registration failed. Please check your details.";
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Account already registered. Please go to the Login page.";
      } else if (err.code === "permission-denied") {
        errorMessage = "Security policy blocked account creation. Please contact support.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-20 px-4 selection:bg-[#00ff66] selection:text-black relative">
       <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-[#00ff66] flex items-center gap-2 transition-colors z-10">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold tracking-tighter mb-2">
            <div className="w-10 h-10 bg-[#00ff66] rounded flex items-center justify-center text-black">
              <TrendingUp size={24} />
            </div>
            Market <span className="text-[#ffd700]">Digital</span>
          </Link>
          <h2 className="text-sm text-gray-500 font-bold uppercase tracking-[0.3em]">Institutional Account Portal</h2>
        </div>

        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-8 md:p-12 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff66] via-[#ffd700] to-[#00ff66]"></div>
          
          <form onSubmit={handleRegister} className="space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div 
                   initial={{ height: 0, opacity: 0, scale: 0.9 }}
                   animate={{ height: "auto", opacity: 1, scale: 1 }}
                   exit={{ height: 0, opacity: 0, scale: 0.9 }}
                   className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl text-center font-bold uppercase tracking-widest text-xs flex flex-col items-center gap-4 overflow-hidden"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-black">
                    <Hash size={24} />
                  </div>
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div 
                   initial={{ height: 0, opacity: 0, scale: 0.9 }}
                   animate={{ height: "auto", opacity: 1, scale: 1 }}
                   className="bg-[#00ff66]/10 border border-[#00ff66]/50 text-[#00ff66] p-8 rounded-xl text-center font-black uppercase tracking-[0.2em] text-sm flex flex-col items-center gap-4 overflow-hidden"
                >
                  <div className="w-16 h-16 bg-[#00ff66] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,102,0.4)]">
                    <CheckCircle2 size={32} />
                  </div>
                  Account Created Successfully!
                  <p className="text-[10px] text-gray-500 animate-pulse lowercase font-medium tracking-normal">Redirecting to secure terminal...</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input name="firstName" required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input name="lastName" required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="email" name="email" required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="tel" name="phone" required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                   <select name="country" className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none appearance-none" onChange={handleChange} value={formData.country}>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Australia">Australia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Solomon Islands">Solomon Islands</option>
                    <option value="Fiji">Fiji</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input name="city" required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2 border-t border-[#1a1a1a] pt-4 mt-2">
                <label className="text-[10px] font-bold text-[#ffd700] uppercase tracking-[0.3em]">Withdrawal Security PIN</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="text" name="securityPin" maxLength={6} required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" placeholder="Enter a 4-6 digit numeric PIN" onChange={handleChange} />
                </div>
                <p className="text-[10px] text-gray-600 uppercase font-medium">Critical: This PIN is required for every withdrawal transaction.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Access Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="password" name="password" required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="password" name="confirmPassword" required className="w-full bg-black border border-[#222] rounded-lg py-3 pl-10 text-sm text-white focus:border-[#00ff66] outline-none" onChange={handleChange} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-[#00ff66] to-[#00cc52] text-black font-black uppercase tracking-[0.2em] rounded animate-pulse shadow-[0_0_40px_rgba(0,255,102,0.2)] hover:animate-none transition-all disabled:opacity-50"
            >
              {loading ? "INITIALIZING SECURE ACCOUNT..." : "CREATE MARKET TRADING ACCOUNT"}
            </button>
          </form>

          <p className="text-center mt-10 text-xs text-gray-500 font-medium uppercase tracking-widest">
            Already have an account? {" "}
            <Link to="/login" className="text-[#00ff66] hover:underline underline-offset-4 font-bold">Sign In Here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
