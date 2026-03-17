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
    const active = moas.filter(m => m.status === 'APPROVED' && !m.isDeleted).length;
    const processing = moas.filter(m => m.status === 'PROCESSING' && !m.isDeleted).length;
    const expired = moas.filter(m => m.status === 'EXPIRED' && !m.isDeleted).length;
    const expiring = moas.filter(m => {
      if (m.isDeleted || m.status !== 'APPROVED') return false;
      const expDate = parseISO(m.expirationDate);
      const twoMonthsFromNow = addMonths(new Date(), 2);
      return isBefore(expDate, twoMonthsFromNow) && !isBefore(expDate, new Date());
    }).length;

    return { active, processing, expired, expiring };
  }, [moas]);

  const cards = [
    { label: 'Active MOAs', value: stats.active, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Processing', value: stats.processing, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Expiring Soon', value: stats.expiring, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Expired', value: stats.expired, icon: Calendar, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-stone-500 mt-1">Real-time statistics of Memoranda of Agreement.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4`}>
              <card.icon size={24} />
            </div>
            <p className="text-stone-500 text-sm font-medium uppercase tracking-wider">{card.label}</p>
            <h3 className="text-4xl font-bold mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity or Chart could go here */}
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600" />
              Industry Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {Object.entries(
              moas.reduce((acc, m) => {
                acc[m.industryType] = (acc[m.industryType] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([type, count]) => (
              <div key={type} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{type}</span>
                    <span className="text-sm text-stone-500">{count as number}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ width: `${((count as number) / (moas.length || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" />
              By College
            </h3>
          </div>
          <div className="space-y-4">
            {Object.entries(
              moas.reduce((acc, m) => {
                acc[m.endorsedByCollege] = (acc[m.endorsedByCollege] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([college, count]) => (
              <div key={college} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{college}</span>
                    <span className="text-sm text-stone-500">{count as number}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${((count as number) / (moas.length || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
