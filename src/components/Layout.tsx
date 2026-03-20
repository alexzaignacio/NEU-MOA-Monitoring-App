import React from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { logGlobalAction } from '../services/moaService';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X,
  ClipboardList,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile, isAdmin, isFaculty } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'moas', label: 'MOA Management', icon: FileText, show: true },
    { id: 'users', label: 'User Management', icon: Users, show: isAdmin },
    { id: 'audit', label: 'Audit Trail', icon: ClipboardList, show: isAdmin || isFaculty },
  ];

  const handleLogout = async () => {
    await logGlobalAction('logout', 'User signed out');
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-neu-black flex flex-col md:flex-row font-sans text-neu-white overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-neu-black border-r border-white/5 p-8 shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-orange-gradient rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-neu-orange/40">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="font-black text-xl leading-none tracking-tighter text-white uppercase">NEU MOA</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mt-1">Monitoring</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.filter(item => item.show).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-white/5 text-white font-black shadow-xl border border-white/10' 
                  : 'text-white/30 hover:bg-white/5 hover:text-white/60'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-orange-gradient rounded-r-full"
                />
              )}
              <item.icon size={22} className={activeTab === item.id ? 'text-neu-orange' : 'group-hover:text-neu-orange transition-colors'} />
              <span className="tracking-tighter uppercase text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 relative">
          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 w-full mb-6 glass-card border border-white/10 rounded-[2rem] shadow-2xl p-3 z-50 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Account Settings</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsProfileDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                    activeTab === 'profile' ? 'bg-orange-gradient text-white font-black' : 'hover:bg-white/5 text-white/60'
                  }`}
                >
                  <UserCircle size={20} className={activeTab === 'profile' ? 'text-white' : 'text-neu-orange'} />
                  <span className="text-xs uppercase font-black tracking-widest">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all mt-1"
                >
                  <LogOut size={20} />
                  <span className="text-xs uppercase font-black tracking-widest">Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-[2rem] transition-all border border-transparent group ${
              isProfileDropdownOpen ? 'bg-white/5 border-white/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-gradient flex items-center justify-center text-white font-black shrink-0 shadow-xl shadow-neu-orange/20 group-hover:scale-105 transition-transform">
              {profile?.displayName?.[0] || profile?.email?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden text-left flex-1">
              <p className="font-black truncate text-sm text-white uppercase tracking-tighter">{profile?.displayName || 'User'}</p>
              <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] mt-0.5">{profile?.role}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-neu-black text-white p-6 flex items-center justify-between sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-black tracking-tighter uppercase text-lg">NEU MOA</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/40 hover:text-white transition-colors">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 top-[89px] bg-neu-black z-40 p-8 flex flex-col"
          >
            <nav className="space-y-4 flex-1">
              {menuItems.filter(item => item.show).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] text-xl uppercase font-black tracking-tighter ${
                    activeTab === item.id 
                      ? 'bg-orange-gradient text-white shadow-2xl' 
                      : 'text-white/20 border border-white/5'
                  }`}
                >
                  <item.icon size={26} />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] text-xl uppercase font-black tracking-tighter ${
                  activeTab === 'profile' 
                    ? 'bg-orange-gradient text-white shadow-2xl' 
                    : 'text-white/20 border border-white/5'
                }`}
              >
                <UserCircle size={26} />
                <span>My Profile</span>
              </button>
            </nav>
            <button 
              onClick={handleLogout}
              className="mt-auto flex items-center gap-5 px-6 py-6 rounded-[2rem] text-red-500 font-black uppercase tracking-tighter border border-red-500/20 bg-red-500/5"
            >
              <LogOut size={26} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full relative">
        {/* Background Accents */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-neu-orange/5 blur-[150px] rounded-full -z-10" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-neu-red/5 blur-[150px] rounded-full -z-10" />
        
        {children}
      </main>
    </div>
  );
};
