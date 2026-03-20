import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { LogIn, Mail, Lock, AlertCircle, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logGlobalAction } from '../services/moaService';

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
      } else {
        await logGlobalAction('login', `User logged in via Google`);
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
        
        // Explicitly create user profile to ensure state persistence and correct display name
        const profileRef = doc(db, 'users', userCredential.user.uid);
        const adminEmails = ['jcesperanza@neu.edu.ph', 'alexzagayle.ignacio@neu.edu.ph'];
        let role = 'student';
        
        if (adminEmails.includes(email)) {
          role = 'admin';
        } else if (email === 'faculty@neu.edu.ph') {
          role = 'faculty';
        } else if (email === 'student@neu.edu.ph') {
          role = 'student';
        }

        await setDoc(profileRef, {
          uid: userCredential.user.uid,
          email: email,
          displayName: displayName || email.split('@')[0],
          role,
          isBlocked: false,
          canMaintainMOA: false,
          createdAt: new Date().toISOString()
        });

        // Log sign up - firestore rules now allow this even if profile isn't fully ready
        await logGlobalAction('login', `New account created: ${email}`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        await logGlobalAction('login', `User logged in via Email`);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      let errorMessage = 'An error occurred during authentication.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else {
        // Handle Firestore errors or other non-auth errors
        try {
          // If it's a JSON string from handleFirestoreError
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            errorMessage = `System Error: ${parsed.error}`;
          }
        } catch (e) {
          errorMessage = error.message || errorMessage;
        }
      }
      setError(errorMessage);
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
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 bg-neu-black relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-neu-orange/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md flex flex-col justify-center relative z-20"
        >
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center mb-6">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              className="w-16 h-16 mb-2 drop-shadow-[0_0_10px_rgba(255,77,0,0.3)]"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-xl font-black text-neu-white uppercase tracking-tighter">NEU MOA</h1>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden max-w-md mx-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-gradient" />
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-neu-white uppercase tracking-tighter leading-none mb-1">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
              <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest">
                {isSignUp ? 'Create your account' : 'Access the Monitoring Portal'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-neu-white text-neu-black px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-white/90 transition-all shadow-xl disabled:opacity-70 mb-4 text-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
              )}
              {isSignUp ? 'SIGN UP WITH GOOGLE' : 'SIGN IN WITH GOOGLE'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#111] px-4 text-white/30 font-black tracking-[0.3em]">OR</span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              {isSignUp && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-orange-gradient opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl pointer-events-none" />
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neu-orange transition-colors" size={16} />
                  <input 
                    type="text"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neu-white font-normal text-sm placeholder:text-white/20 focus:border-neu-orange outline-none transition-all relative z-10"
                  />
                </div>
              )}
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-gradient opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl pointer-events-none" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neu-orange transition-colors" size={16} />
                <input 
                  type="email"
                  placeholder="Institutional Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neu-white font-normal text-sm placeholder:text-white/20 focus:border-neu-orange outline-none transition-all relative z-10"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-orange-gradient opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl pointer-events-none" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neu-orange transition-colors" size={16} />
                <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-neu-white font-normal text-sm placeholder:text-white/20 focus:border-neu-orange outline-none transition-all relative z-10"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-gradient text-neu-white py-3.5 rounded-xl font-black uppercase tracking-tighter hover:opacity-90 transition-all shadow-2xl shadow-neu-orange/20 disabled:opacity-70 mt-2 text-sm"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin mx-auto" />
                ) : (
                  isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN WITH EMAIL'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
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

          <div className="mt-6 text-center">
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

