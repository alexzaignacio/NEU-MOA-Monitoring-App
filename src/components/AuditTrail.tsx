import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { 
  ClipboardList, 
  History, 
  User, 
  Calendar,
  Clock,
  ArrowRight,
  Info,
  LogIn,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';

export const AuditTrail: React.FC = () => {
  const { isAdmin, isFaculty } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
    
    // Faculty can only see global logs
    if (isFaculty) {
      q = query(
        collection(db, 'audit_logs'), 
        where('type', '==', 'global'),
        orderBy('timestamp', 'desc'), 
        limit(100)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
      setLogs(logsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isFaculty]);

  const getOperationColor = (op: AuditLog['operation']) => {
    switch (op) {
      case 'insert': return 'bg-neu-orange/20 text-neu-orange border-neu-orange/30';
      case 'edit': return 'bg-white/10 text-white/60 border-white/20';
      case 'delete': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'recover': return 'bg-neu-orange/20 text-neu-orange border-neu-orange/30';
      case 'login': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'logout': return 'bg-white/10 text-white/40 border-white/20';
      default: return 'bg-white/5 text-white/40 border-white/5';
    }
  };

  const getOperationIcon = (op: AuditLog['operation']) => {
    switch (op) {
      case 'login': return <LogIn size={24} />;
      case 'logout': return <LogOut size={24} />;
      default: return <ClipboardList size={24} />;
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-5xl font-black tracking-tighter text-neu-white uppercase leading-none">Audit Trail</h2>
        <p className="text-white/40 font-black uppercase tracking-widest text-xs mt-2">Track all system operations and user actions.</p>
      </header>

      <div className="glass-card rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 bg-orange-gradient border-b border-white/10 flex items-center justify-between text-neu-white">
          <div className="flex items-center gap-3 font-black uppercase tracking-widest text-xs">
            <History size={20} className="text-neu-white" />
            Recent Activity
          </div>
          <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">
            {isFaculty ? 'Showing global system logs' : 'Showing last 100 operations'}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {logs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 hover:bg-white/5 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6 group"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border ${getOperationColor(log.operation)} group-hover:scale-105 transition-transform`}>
                  {getOperationIcon(log.operation)}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-normal text-neu-white uppercase tracking-tighter text-lg leading-none">{log.userName}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getOperationColor(log.operation)}`}>
                      {log.operation}
                    </span>
                    {log.moaName && (
                      <>
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">on</span>
                        <span className="font-normal text-neu-white uppercase tracking-tighter text-lg leading-none">{log.moaName}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-white/40 mt-2 flex items-center gap-2 font-normal uppercase tracking-tighter italic">
                    <Info size={16} className="text-neu-orange" /> {log.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-white/20 shrink-0">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-neu-orange/40" />
                  <span className="text-xs font-black uppercase tracking-widest">{format(parseISO(log.timestamp), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-neu-orange/40" />
                  <span className="text-xs font-black uppercase tracking-widest">{format(parseISO(log.timestamp), 'HH:mm:ss')}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {logs.length === 0 && !loading && (
            <div className="py-32 text-center text-white/20">
              <ClipboardList size={80} className="mx-auto mb-6 opacity-10" />
              <p className="font-black uppercase tracking-widest">No audit logs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
