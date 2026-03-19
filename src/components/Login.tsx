import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('@neu.edu.ph');
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email && !validateEmail(user.email)) {
        await auth.signOut();
        setError('Only institutional emails (@neu.edu.ph) are allowed.');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore, another popup was opened
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('Please use your institutional email (@neu.edu.ph).');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row font-sans bg-neu-black overflow-hidden">
      {/* Left Panel - School Photo with Dark Overlay */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4FOoIBA6tUB6GPFw477Hf2Hkr0W9caaH5aw&s")' }}
        />
        {/* Dark Overlay / Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-neu-black via-neu-black/80 to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col items-start justify-center w-full p-16 text-neu-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              className="w-32 h-32 drop-shadow-[0_0_15px_rgba(255,77,0,0.5)]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <div className="max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl font-black mb-4 tracking-tighter leading-none uppercase"
            >
              WE'VE SCALED <br />
              <span className="text-orange-gradient">MONITORING</span> <br />
              YOURS IS NEXT
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-white/60 font-medium max-w-md"
            >
              THIS IS WHAT GROWTH LOOKS LIKE. <br />
              Empowering the university community with a modern, secure, and streamlined MOA monitoring system.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-neu-black relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-neu-orange/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md max-h-screen overflow-y-auto py-8"
        >
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              className="w-20 h-20 mb-4 drop-shadow-[0_0_10px_rgba(255,77,0,0.3)]"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-2xl font-black text-neu-white uppercase tracking-tighter">NEU MOA</h1>
          </div>

          <div className="glass-card p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-gradient" />
            
            <div className="mb-8">
              <h2 className="text-3xl font-black text-neu-white uppercase tracking-tighter leading-none mb-2">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
              <p className="text-white/40 font-bold text-xs uppercase tracking-widest">
                {isSignUp ? 'Create your account' : 'Access the Monitoring Portal'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-neu-white text-neu-black px-6 py-3.5 rounded-xl font-black uppercase tracking-tighter hover:bg-white/90 transition-all shadow-xl disabled:opacity-70 mb-6"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              )}
              {isSignUp ? 'SIGN UP WITH GOOGLE' : 'SIGN IN WITH GOOGLE'}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#111] px-4 text-white/30 font-black tracking-[0.3em]">OR</span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-gradient opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl" />
                  <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neu-orange transition-colors" size={18} />
                  <input 
                    type="text"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-neu-white font-normal placeholder:text-white/20 focus:border-neu-orange outline-none transition-all"
                  />
                </div>
              )}
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-gradient opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neu-orange transition-colors" size={18} />
                <input 
                  type="email"
                  placeholder="Institutional Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-neu-white font-normal placeholder:text-white/20 focus:border-neu-orange outline-none transition-all"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-gradient opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neu-orange transition-colors" size={18} />
                <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-neu-white font-normal placeholder:text-white/20 focus:border-neu-orange outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-gradient text-neu-white py-4 rounded-xl font-black uppercase tracking-tighter hover:opacity-90 transition-all shadow-2xl shadow-neu-orange/20 disabled:opacity-70 mt-4"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin mx-auto" />
                ) : (
                  isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN WITH EMAIL'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                {isSignUp ? 'Already have an account?' : 'Need an account?'} 
                <span 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-neu-orange font-black cursor-pointer hover:underline ml-2"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] flex flex-wrap justify-center gap-x-6 gap-y-2">
              <span className="hover:text-white/40 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white/40 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white/40 cursor-pointer transition-colors">© 2026 NEU</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

