import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ShieldCheck, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      alert('Login failed. Please use your institutional email.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-stone-200 overflow-hidden"
      >
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-100">
            <ShieldCheck size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Welcome Back</h1>
          <p className="text-stone-500 mb-10">NEU MOA Monitoring System</p>

          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-stone-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
            >
              <LogIn size={20} />
              Sign in with Google
            </button>
            
            <p className="text-xs text-stone-400 leading-relaxed px-4">
              By signing in, you agree to use your institutional Google-based email as required by university policy.
            </p>
          </div>
        </div>
        
        <div className="bg-stone-50 p-6 text-center border-t border-stone-100">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            New Era University • MOA Monitoring
          </p>
        </div>
      </motion.div>
    </div>
  );
};
