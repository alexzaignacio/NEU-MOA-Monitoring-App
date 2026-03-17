import React from 'react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X,
  ClipboardList,
  ShieldCheck
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'moas', label: 'MOA Management', icon: FileText, show: true },
    { id: 'users', label: 'User Management', icon: Users, show: isAdmin },
    { id: 'audit', label: 'Audit Trail', icon: ClipboardList, show: isAdmin },
  ];

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans text-stone-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">NEU MOA</h1>
            <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Monitoring</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.filter(item => item.show).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm' 
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold">
              {profile?.displayName?.[0] || profile?.email?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold truncate text-sm">{profile?.displayName || 'User'}</p>
              <p className="text-xs text-stone-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <h1 className="font-bold">NEU MOA</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-[65px] bg-white z-40 p-6 flex flex-col"
          >
            <nav className="space-y-4 flex-1">
              {menuItems.filter(item => item.show).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-lg ${
                    activeTab === item.id 
                      ? 'bg-emerald-50 text-emerald-700 font-bold' 
                      : 'text-stone-600'
                  }`}
                >
                  <item.icon size={24} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <button 
              onClick={handleLogout}
              className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-red-600 font-bold border border-red-100"
            >
              <LogOut size={24} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
