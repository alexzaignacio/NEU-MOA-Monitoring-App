import React, { useMemo } from 'react';
import { MOA } from '../types';
import { 
  FileCheck, 
  Clock, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, isBefore, addMonths, parseISO } from 'date-fns';

interface DashboardProps {
  moas: MOA[];
}

export const Dashboard: React.FC<DashboardProps> = ({ moas }) => {
  const stats = useMemo(() => {
    const active = moas.filter(m => m.moaStatus === 'APPROVED' && !m.isDeleted).length;
    const processing = moas.filter(m => m.moaStatus === 'PROCESSING' && !m.isDeleted).length;
    const expired = moas.filter(m => m.moaStatus === 'EXPIRED' && !m.isDeleted).length;
    const expiring = moas.filter(m => {
      if (m.isDeleted || m.moaStatus !== 'APPROVED') return false;
      const expDate = parseISO(m.expirationDate);
      const twoMonthsFromNow = addMonths(new Date(), 2);
      return isBefore(expDate, twoMonthsFromNow) && !isBefore(expDate, new Date());
    }).length;

    return { active, processing, expired, expiring };
  }, [moas]);

  const cards = [
    { label: 'Active MOAs', value: stats.active, icon: FileCheck, color: 'text-neu-orange', trend: '+12%' },
    { label: 'Processing', value: stats.processing, icon: Clock, color: 'text-neu-white', trend: '+5%' },
    { label: 'Expiring Soon', value: stats.expiring, icon: AlertCircle, color: 'text-neu-red', trend: '-2%' },
    { label: 'Expired', value: stats.expired, icon: Calendar, color: 'text-white/20', trend: '0%' },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-5xl font-black tracking-tighter text-neu-white uppercase leading-none">
          WE'VE SCALED <br />
          <span className="text-orange-gradient">CHANNELS</span>
        </h2>
        <p className="text-white/40 mt-4 font-bold uppercase tracking-widest text-sm">Real-time system monitoring & analytics</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 rounded-[2rem] hover:border-white/20 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <card.icon size={64} />
            </div>
            
            <div className="relative z-10">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-5xl font-black text-neu-white tracking-tighter">{card.value}</h3>
                <span className={`text-[10px] font-black ${card.trend.startsWith('+') ? 'text-neu-orange' : 'text-white/20'}`}>
                  {card.trend}
                </span>
              </div>
              
              {/* Mini Trend Line */}
              <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ delay: 0.5 + (index * 0.1), duration: 1 }}
                  className="h-full bg-orange-gradient w-2/3 rounded-full shadow-[0_0_10px_rgba(255,77,0,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-10 rounded-[2.5rem]"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-neu-white">
              Industry Distribution
            </h3>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neu-orange">
              <TrendingUp size={20} />
            </div>
          </div>
          
          <div className="space-y-8">
            {Object.entries(
              moas.filter(m => !m.isDeleted).reduce((acc, m) => {
                acc[m.industryType] = (acc[m.industryType] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([type, count]) => (
              <div key={type} className="group">
                <div className="flex justify-between mb-3 items-end">
                  <span className="text-xs font-normal text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">{type}</span>
                  <span className="text-2xl font-normal text-neu-white tracking-tighter leading-none">{count as number}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((count as number) / (moas.filter(m => !m.isDeleted).length || 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="bg-orange-gradient h-full rounded-full shadow-[0_0_10px_rgba(255,77,0,0.3)]" 
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-10 rounded-[2.5rem]"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-neu-white">
              By College
            </h3>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neu-orange">
              <Building2 size={20} />
            </div>
          </div>
          
          <div className="space-y-8">
            {Object.entries(
              moas.filter(m => !m.isDeleted).reduce((acc, m) => {
                acc[m.endorsedByCollege] = (acc[m.endorsedByCollege] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([college, count]) => (
              <div key={college} className="group">
                <div className="flex justify-between mb-3 items-end">
                  <span className="text-xs font-normal text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">{college}</span>
                  <span className="text-2xl font-normal text-neu-white tracking-tighter leading-none">{count as number}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((count as number) / (moas.filter(m => !m.isDeleted).length || 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="bg-orange-gradient h-full rounded-full shadow-[0_0_10px_rgba(255,77,0,0.3)]" 
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
