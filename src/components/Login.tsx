import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError('Please use your institutional email (@neu.edu.ph).');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred during sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      {/* Left Panel - Hidden on small screens or shown as a header */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-neu-blue">
        <div 
          className="absolute inset-0 z-0 opacity-40 bg-cover bg-center grayscale-[50%]"
          style={{ backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4FOoIBA6tUB6GPFw477Hf2Hkr0W9caaH5aw&s")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neu-blue/90 to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col items-center justify-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              className="w-48 h-48 drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <div className="text-center max-w-md">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">NEU MOA</h1>
            <h2 className="text-3xl font-semibold text-neu-orange mb-6">Monitoring App</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Empowering the university community with a modern, secure, and streamlined library entry monitoring system.
            </p>
          </div>

          <div className="mt-12 space-y-4 w-full max-w-xs">
            {[
              'Secure Role-Based Access',
              'Real-time Visitor Tracking',
              'Automated Entry Logs'
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-3 text-sm font-medium text-white/70"
              >
                <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center text-[10px]">
                  ✓
                </div>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-stone-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              className="w-24 h-24 mb-4"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-2xl font-bold text-neu-blue">NEU Library</h1>
            <p className="text-stone-500">Visitor Portal</p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-stone-200 border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-neu-orange" />
            
            <div className="text-center mb-8">
              <div className="hidden md:flex w-20 h-20 bg-white rounded-full shadow-lg items-center justify-center mx-auto mb-6 border border-stone-50 p-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
                  alt="NEU Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-3xl font-bold text-stone-900">Welcome back</h2>
              <p className="text-stone-500 mt-2">Sign in with your university account</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-[#001F3F] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#00152b] transition-all shadow-lg shadow-stone-200 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              )}
              SIGN IN WITH GOOGLE
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-stone-400 font-bold tracking-widest">OR</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="email"
                  placeholder="Institutional Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-neu-orange/20 focus:border-neu-orange outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-neu-orange/20 focus:border-neu-orange outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-neu-accent text-white py-4 rounded-2xl font-bold hover:bg-neu-accent/90 transition-all shadow-lg shadow-stone-200 disabled:opacity-70 mt-4"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin mx-auto" />
                ) : (
                  'SIGN IN WITH EMAIL'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-stone-500">
                Need an account? <span className="text-neu-accent font-bold cursor-pointer hover:underline">Sign Up</span>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-stone-400 flex flex-wrap justify-center gap-x-4 gap-y-2">
              <span>By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span></span>
              <span>and <span className="underline cursor-pointer">Privacy Policy</span>.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

