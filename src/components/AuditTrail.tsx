import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { 
  ClipboardList, 
  History, 
  User, 
  Calendar,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
      setLogs(logsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getOperationColor = (op: AuditLog['operation']) => {
    switch (op) {
      case 'insert': return 'bg-emerald-100 text-emerald-700';
      case 'edit': return 'bg-blue-100 text-blue-700';
      case 'delete': return 'bg-red-100 text-red-700';
      case 'recover': return 'bg-amber-100 text-amber-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
        <p className="text-stone-500 mt-1">Track all system operations and user actions.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-600 font-bold uppercase tracking-widest text-xs">
            <History size={16} />
            Recent Activity
          </div>
          <span className="text-xs text-stone-400 font-medium">Showing last 100 operations</span>
        </div>

        <div className="divide-y divide-stone-50">
          {logs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getOperationColor(log.operation)}`}>
                  <ClipboardList size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-900">{log.userName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getOperationColor(log.operation)}`}>
                      {log.operation}
                    </span>
                    <span className="text-stone-400 text-sm">on</span>
                    <span className="font-semibold text-stone-700">{log.moaName}</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                    <Info size={14} /> {log.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-stone-400 shrink-0">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">{format(parseISO(log.timestamp), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span className="text-xs font-medium">{format(parseISO(log.timestamp), 'HH:mm:ss')}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {logs.length === 0 && !loading && (
            <div className="p-20 text-center text-stone-400">
              <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
              <p>No audit logs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
