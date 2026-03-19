import React from 'react';
import { useAuth } from '../AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Building,
  Briefcase,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const Profile: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const infoItems = [
    { label: 'Full Name', value: profile.displayName || 'Not set', icon: User },
    { label: 'Email Address', value: profile.email, icon: Mail },
    { label: 'System Role', value: profile.role, icon: Shield, capitalize: true },
    { label: 'Department/College', value: profile.department || 'Not assigned', icon: Building },
    { label: 'Position', value: profile.position || 'Not specified', icon: Briefcase },
    { 
      label: 'Account Status', 
      value: profile.isBlocked ? 'Blocked' : 'Active', 
      icon: profile.isBlocked ? XCircle : CheckCircle2,
      color: profile.isBlocked ? 'text-red-500' : 'text-neu-orange'
    },
    { 
      label: 'Member Since', 
      value: profile.createdAt ? format(new Date(profile.createdAt), 'MMMM dd, yyyy') : 'Recently', 
      icon: Calendar 
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header>
        <h2 className="text-5xl font-black tracking-tighter text-neu-white uppercase leading-none">User Profile</h2>
        <p className="text-white/40 font-black uppercase tracking-widest text-xs mt-2">Manage and view your account information.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass-card p-10 rounded-[3rem] border-white/5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-gradient" />
          <div className="w-40 h-40 rounded-[2.5rem] bg-orange-gradient flex items-center justify-center text-neu-white text-5xl font-black mb-8 shadow-2xl shadow-neu-orange/40 group-hover:scale-105 transition-transform duration-500">
            {profile.displayName?.[0] || profile.email?.[0]?.toUpperCase()}
          </div>
          <h3 className="text-3xl font-normal text-neu-white uppercase tracking-tighter leading-none mb-2">{profile.displayName || 'User'}</h3>
          <p className="text-white/40 text-xs font-normal uppercase tracking-widest mb-8">{profile.email}</p>
          
          <div className="w-full pt-8 border-t border-white/5">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-neu-orange/20 text-neu-orange text-[10px] font-black uppercase tracking-widest border border-neu-orange/30">
              <Shield size={16} />
              {profile.role}
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card p-12 rounded-[3rem] border-white/5 shadow-2xl relative overflow-hidden"
        >
          <h3 className="text-2xl font-black mb-12 flex items-center gap-3 text-neu-white uppercase tracking-tighter">
            <div className="w-1 h-8 bg-orange-gradient rounded-full" />
            Account Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {infoItems.map((item) => (
              <div key={item.label} className="space-y-2 group">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-3 group-hover:text-white/40 transition-colors">
                  <item.icon size={16} className="text-neu-orange/60" />
                  {item.label}
                </p>
                <p className={`text-neu-white font-normal uppercase tracking-tighter text-lg leading-none ${item.capitalize ? 'capitalize' : ''} ${item.color || ''}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {profile.role === 'faculty' && (
            <div className="mt-12 p-8 bg-white/5 rounded-[2rem] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neu-orange/5 blur-3xl -z-10" />
              <h4 className="font-black text-neu-white mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                <Shield size={14} className="text-neu-orange" />
                Faculty Permissions
              </h4>
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,77,0,0.5)] ${profile.canMaintainMOA ? 'bg-neu-orange' : 'bg-white/10'}`} />
                <p className="text-sm text-white/60 font-black uppercase tracking-tighter">
                  {profile.canMaintainMOA 
                    ? 'Authorized to create and maintain MOA records.' 
                    : 'Read-only access to MOA records.'}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
