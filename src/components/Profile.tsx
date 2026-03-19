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
      color: profile.isBlocked ? 'text-red-600' : 'text-emerald-600'
    },
    { 
      label: 'Member Since', 
      value: profile.createdAt ? format(new Date(profile.createdAt), 'MMMM dd, yyyy') : 'Recently', 
      icon: Calendar 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
        <p className="text-stone-500 mt-1">Manage and view your account information.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col items-center text-center"
        >
          <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-4xl font-bold mb-6 border-4 border-white shadow-lg">
            {profile.displayName?.[0] || profile.email?.[0]?.toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-stone-900">{profile.displayName || 'User'}</h3>
          <p className="text-stone-500 text-sm mb-6">{profile.email}</p>
          
          <div className="w-full pt-6 border-t border-stone-100">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold uppercase tracking-wider">
              <Shield size={16} />
              {profile.role}
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm"
        >
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            Account Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {infoItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <item.icon size={14} />
                  {item.label}
                </p>
                <p className={`text-stone-900 font-medium ${item.capitalize ? 'capitalize' : ''} ${item.color || ''}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {profile.role === 'faculty' && (
            <div className="mt-10 p-6 bg-stone-50 rounded-3xl border border-stone-100">
              <h4 className="font-bold text-stone-900 mb-2">Faculty Permissions</h4>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${profile.canMaintainMOA ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                <p className="text-sm text-stone-600">
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
