import React, { useState, useMemo, useEffect } from 'react';
import { MOA, MOAStatus, AuditLog } from '../types';
import { useAuth } from '../AuthContext';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Mail,
  MapPin,
  User as UserIcon,
  Building,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { createMOA, updateMOA, softDeleteMOA, recoverMOA } from '../services/moaService';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

interface MOAManagementProps {
  moas: MOA[];
}

export const MOAManagement: React.FC<MOAManagementProps> = ({ moas }) => {
  const { isAdmin, isFaculty, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMOA, setEditingMOA] = useState<MOA | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [moaToDelete, setMoaToDelete] = useState<MOA | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedMOAForDetails, setSelectedMOAForDetails] = useState<MOA | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const canMaintain = isAdmin || (isFaculty && profile?.canMaintainMOA);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredMOAs = useMemo(() => {
    return moas.filter(m => {
      const matchesSearch = 
        m.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.hteid.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || m.moaStatus === statusFilter;
      const matchesCollege = collegeFilter === 'all' || m.endorsedByCollege === collegeFilter;
      
      // Faculty and Students can ONLY see active MOAs
      // Admin can toggle between active and deleted
      const isDeleted = m.status === 'deleted' || m.isDeleted;
      
      if (isAdmin) {
        const matchesDeleted = showDeleted ? isDeleted : !isDeleted;
        return matchesSearch && matchesStatus && matchesCollege && matchesDeleted;
      } else {
        // Faculty and Students: strictly active only
        return matchesSearch && matchesStatus && matchesCollege && !isDeleted;
      }
    });
  }, [moas, searchTerm, statusFilter, collegeFilter, showDeleted, isAdmin]);

  const handleOpenForm = (moa?: MOA) => {
    if (moa) setEditingMOA(moa);
    else setEditingMOA(null);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!moaToDelete) return;
    try {
      await softDeleteMOA(moaToDelete.id, moaToDelete.companyName);
      showToast('MOA MOVED TO TRASH');
      setIsConfirmOpen(false);
      setMoaToDelete(null);
    } catch (error) {
      showToast('FAILED TO DELETE MOA');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[100] flex items-center gap-3 glass-card text-neu-white px-8 py-4 rounded-2xl shadow-2xl border-white/10"
          >
            <CheckCircle2 size={20} className="text-neu-orange" />
            <span className="font-medium uppercase tracking-tighter">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-5xl font-medium tracking-tighter text-neu-white uppercase leading-none">MOA Records</h2>
          <p className="text-white/40 font-medium uppercase tracking-widest text-xs mt-2">Manage and track all Memoranda of Agreement.</p>
        </div>
        
        {canMaintain && (
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 bg-orange-gradient text-neu-white px-8 py-4 rounded-xl font-medium uppercase tracking-tighter hover:opacity-90 transition-all shadow-2xl shadow-neu-orange/20"
          >
            <Plus size={20} />
            Add New MOA
          </button>
        )}
      </div>

      <div className="glass-card p-4 rounded-[2rem] border-white/5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="SEARCH COMPANY, CONTACT, OR HTEID..." 
            className="w-full pl-12 pr-4 py-4 bg-white/5 border-none rounded-xl focus:ring-2 focus:ring-neu-orange transition-all font-medium uppercase tracking-tighter text-neu-white placeholder:text-white/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="bg-white/5 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-neu-orange transition-all text-xs font-medium uppercase tracking-widest text-neu-white cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all" className="bg-neu-black">All Statuses</option>
            <option value="APPROVED" className="bg-neu-black">Approved</option>
            <option value="PROCESSING" className="bg-neu-black">Processing</option>
            <option value="EXPIRED" className="bg-neu-black">Expired</option>
            <option value="EXPIRING" className="bg-neu-black">Expiring</option>
          </select>

          {isAdmin && (
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-6 py-4 rounded-xl text-xs font-medium uppercase tracking-widest transition-all ${
                showDeleted ? 'bg-neu-orange text-neu-white' : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {showDeleted ? 'Showing Deleted' : 'Show Deleted'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          <AnimatePresence mode="popLayout">
            {filteredMOAs.map((moa) => (
              <MOACard 
                key={moa.id} 
                moa={moa} 
                onEdit={() => handleOpenForm(moa)}
                onDelete={() => {
                  setMoaToDelete(moa);
                  setIsConfirmOpen(true);
                }}
                onView={() => setSelectedMOAForDetails(moa)}
                canEdit={canMaintain}
                isAdmin={isAdmin}
                onToast={showToast}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredMOAs.length === 0 && (
          <div className="text-center py-24 glass-card rounded-[2.5rem] border-dashed border-white/10">
            <div className="flex flex-col items-center">
              <FileText size={64} className="mx-auto text-white/10 mb-6" />
              <p className="text-white/40 font-medium uppercase tracking-widest">No MOA records found matching your criteria.</p>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <MOAForm 
          moa={editingMOA} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={(msg) => {
            setIsFormOpen(false);
            showToast(msg);
          }}
          onToast={showToast}
        />
      )}

      {isConfirmOpen && moaToDelete && (
        <ConfirmationModal
          title="Confirm Deletion"
          message={`Are you sure you want to move ${moaToDelete.companyName} to trash? This action can be reversed by an administrator.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsConfirmOpen(false);
            setMoaToDelete(null);
          }}
        />
      )}

      {selectedMOAForDetails && (
        <MOADetails 
          moa={selectedMOAForDetails} 
          onClose={() => setSelectedMOAForDetails(null)} 
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

const MOACard: React.FC<{ 
  moa: MOA, 
  onEdit: () => void, 
  onDelete: () => void,
  onView: () => void,
  canEdit: boolean, 
  isAdmin: boolean,
  onToast: (msg: string) => void
}> = ({ moa, onEdit, onDelete, onView, canEdit, isAdmin, onToast }) => {
  const { isStudent } = useAuth();
  
  const statusColors = {
    APPROVED: 'bg-neu-orange/20 text-neu-orange border-neu-orange/30',
    PROCESSING: 'bg-white/10 text-white/60 border-white/20',
    EXPIRED: 'bg-red-500/20 text-red-500 border-red-500/30',
    EXPIRING: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  };

  const handleRecover = async () => {
    await recoverMOA(moa.id, moa.companyName);
    onToast('MOA RESTORED SUCCESSFULLY');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass-card rounded-[2rem] border-white/5 hover:border-white/20 transition-all duration-500 group overflow-hidden flex flex-col cursor-pointer ${(moa.status === 'deleted' || moa.isDeleted) ? 'opacity-50 grayscale' : ''}`}
      onClick={onView}
    >
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest border ${statusColors[moa.moaStatus]}`}>
            {moa.moaStatus}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }} 
              className="p-2.5 text-white/20 hover:text-neu-white hover:bg-white/10 rounded-xl transition-all"
              title="View Details"
            >
              <ExternalLink size={18} />
            </button>
            {canEdit && !(moa.status === 'deleted' || moa.isDeleted) && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }} 
                  className="p-2.5 text-white/20 hover:text-neu-white hover:bg-white/10 rounded-xl transition-all"
                  title="Edit MOA"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }} 
                  className="p-2.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete MOA"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            {isAdmin && (moa.status === 'deleted' || moa.isDeleted) && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecover();
                }} 
                className="p-2.5 text-white/20 hover:text-neu-orange hover:bg-neu-orange/10 rounded-xl transition-all"
                title="Recover MOA"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-normal text-neu-white tracking-tighter leading-none mb-3 group-hover:text-orange-gradient transition-all">{moa.companyName}</h3>
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Building size={14} className="text-neu-orange" /> <span className="font-normal">{moa.hteid || 'NO HTEID'}</span>
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4 text-sm font-normal uppercase tracking-tighter text-white/60">
            <MapPin size={18} className="mt-0.5 text-neu-orange shrink-0" />
            <span className="line-clamp-2">{moa.companyAddress}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-normal uppercase tracking-tighter text-white/60">
            <UserIcon size={18} className="text-neu-orange shrink-0" />
            <span>{moa.contactPerson}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-normal uppercase tracking-tighter text-white/60">
            <Mail size={18} className="text-neu-orange shrink-0" />
            <span className="truncate lowercase">{moa.contactPersonEmail}</span>
          </div>
        </div>
      </div>

      {!isStudent && (
        <div className="px-8 py-5 bg-white/5 border-t border-white/5 flex justify-between items-center">
          <div className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
            EFFECTIVE: <span className="text-white/60 font-normal">{moa.effectiveDate}</span>
          </div>
          <div className="text-[10px] text-white/20 uppercase tracking-widest font-medium">
            COLLEGE: <span className="text-white/60 font-normal">{moa.endorsedByCollege}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const MOADetails: React.FC<{
  moa: MOA;
  onClose: () => void;
  isAdmin: boolean;
}> = ({ moa, onClose, isAdmin }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' && isAdmin) {
      setLoadingLogs(true);
      const q = query(
        collection(db, 'audit_logs'),
        where('moaId', '==', moa.id),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
        setLogs(logsData);
        setLoadingLogs(false);
      });
      return () => unsubscribe();
    }
  }, [activeTab, moa.id, isAdmin]);

  return (
    <div className="fixed inset-0 bg-neu-black/80 backdrop-blur-xl z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden border-white/10 flex flex-col"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-neu-black shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-medium uppercase tracking-tighter text-neu-white">{moa.companyName}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">MOA Reference: {moa.hteid || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-white/5 bg-neu-black/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-8 py-4 text-[10px] font-medium uppercase tracking-widest transition-all relative ${
              activeTab === 'details' ? 'text-neu-orange' : 'text-white/20 hover:text-white/40'
            }`}
          >
            Details
            {activeTab === 'details' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neu-orange" />
            )}
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-8 py-4 text-[10px] font-medium uppercase tracking-widest transition-all relative ${
                activeTab === 'history' ? 'text-neu-orange' : 'text-white/20 hover:text-white/40'
              }`}
            >
              History
              {activeTab === 'history' && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neu-orange" />
              )}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-neu-black/20">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <section>
                  <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-neu-orange mb-4">Company Information</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Address</p>
                      <p className="text-sm text-white/80 font-normal uppercase tracking-tighter leading-relaxed">{moa.companyAddress}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Industry Type</p>
                      <p className="text-sm text-white/80 font-normal uppercase tracking-tighter">{moa.industryType}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-neu-orange mb-4">Contact Details</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Contact Person</p>
                      <p className="text-sm text-white/80 font-normal uppercase tracking-tighter">{moa.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Email Address</p>
                      <p className="text-sm text-white/80 font-normal tracking-tighter lowercase">{moa.contactPersonEmail}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section>
                  <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-neu-orange mb-4">Agreement Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-2xl border-white/5">
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm text-neu-white font-medium uppercase tracking-tighter">{moa.moaStatus}</p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border-white/5">
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Record Status</p>
                      <p className="text-sm text-neu-white font-medium uppercase tracking-tighter">{moa.status}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-neu-orange mb-4">Timeline & Endorsement</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-[10px] text-white/20 uppercase tracking-widest">Effective Date</span>
                      <span className="text-sm text-white/80 font-normal">{moa.effectiveDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-[10px] text-white/20 uppercase tracking-widest">Expiration Date</span>
                      <span className="text-sm text-white/80 font-normal">{moa.expirationDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[10px] text-white/20 uppercase tracking-widest">Endorsed By</span>
                      <span className="text-sm text-white/80 font-normal uppercase tracking-tighter">{moa.endorsedByCollege}</span>
                    </div>
                  </div>
                </section>

                <section className="pt-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-white/20 uppercase tracking-widest mb-2">
                      <span>System Metadata</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-white/30 uppercase tracking-tighter">Created: {format(parseISO(moa.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                      <p className="text-[9px] text-white/30 uppercase tracking-tighter">Last Update: {format(parseISO(moa.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-neu-orange border-t-transparent rounded-full animate-spin" />
                </div>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="glass-card p-4 rounded-2xl border-white/5 flex items-start gap-4">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-neu-orange shrink-0">
                      <History size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-medium text-neu-white uppercase tracking-tighter truncate">{log.userName}</p>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest shrink-0">{format(parseISO(log.timestamp), 'MMM dd, HH:mm')}</span>
                      </div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{log.operation}</p>
                      <p className="text-[11px] text-white/60 font-normal uppercase tracking-tighter italic">{log.details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <History size={48} className="mx-auto text-white/5 mb-4" />
                  <p className="text-[10px] text-white/20 uppercase tracking-widest">No history records found for this MOA.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 bg-neu-black flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-xl font-medium uppercase tracking-tighter text-neu-white bg-orange-gradient hover:opacity-90 transition-all shadow-2xl shadow-neu-orange/20"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ConfirmationModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-neu-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-[2.5rem] p-10 border-white/10 shadow-2xl"
      >
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-8">
          <AlertCircle size={32} />
        </div>
        
        <h3 className="text-3xl font-medium text-neu-white tracking-tighter uppercase leading-none mb-4">{title}</h3>
        <p className="text-white/40 font-medium uppercase tracking-widest text-xs leading-relaxed mb-10">{message}</p>
        
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 rounded-xl font-medium uppercase tracking-tighter text-white/40 bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-4 rounded-xl font-medium uppercase tracking-tighter text-neu-white bg-orange-gradient hover:opacity-90 transition-all shadow-2xl shadow-neu-orange/20"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MOAForm: React.FC<{ 
  moa: MOA | null, 
  onClose: () => void,
  onSuccess: (msg: string) => void,
  onToast: (msg: string, type?: 'success' | 'error') => void
}> = ({ moa, onClose, onSuccess, onToast }) => {
  const [formData, setFormData] = useState<Partial<MOA>>(
    moa || {
      companyName: '',
      companyAddress: '',
      contactPerson: '',
      contactPersonEmail: '',
      industryType: '',
      effectiveDate: format(new Date(), 'yyyy-MM-dd'),
      expirationDate: format(new Date(), 'yyyy-MM-dd'),
      moaStatus: 'PROCESSING',
      endorsedByCollege: '',
      hteid: '',
    }
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (moa) {
        await updateMOA(moa.id, formData);
        onSuccess('MOA UPDATED SUCCESSFULLY');
      } else {
        await createMOA(formData);
        onSuccess('MOA CREATED SUCCESSFULLY');
      }
    } catch (error: any) {
      console.error(error);
      let errorMsg = 'ERROR SAVING MOA';
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.error.includes('insufficient permissions')) {
          errorMsg = 'PERMISSION DENIED: YOU CANNOT PERFORM THIS ACTION';
        }
      } catch (e) {
        // Not a JSON error
      }
      onToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neu-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-[550px] max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden border-white/10 flex flex-col"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-orange-gradient text-neu-white shrink-0">
          <h3 className="text-2xl font-medium uppercase tracking-tighter">{moa ? 'Edit MOA Entry' : 'New MOA Entry'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Company Name</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal uppercase tracking-tighter text-neu-white transition-all"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Company Address</label>
              <textarea 
                required
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none min-h-[100px] font-normal uppercase tracking-tighter text-neu-white transition-all"
                value={formData.companyAddress}
                onChange={e => setFormData({...formData, companyAddress: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Contact Person</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal uppercase tracking-tighter text-neu-white transition-all"
                  value={formData.contactPerson}
                  onChange={e => setFormData({...formData, contactPerson: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Contact Email</label>
                <input 
                  required
                  type="email" 
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal tracking-tighter text-neu-white lowercase transition-all"
                  value={formData.contactPersonEmail}
                  onChange={e => setFormData({...formData, contactPersonEmail: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">HTEID</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal uppercase tracking-tighter text-neu-white transition-all"
                  value={formData.hteid}
                  onChange={e => setFormData({...formData, hteid: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Industry Type</label>
                <select 
                  required
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal uppercase tracking-widest text-xs text-neu-white cursor-pointer transition-all"
                  value={formData.industryType}
                  onChange={e => setFormData({...formData, industryType: e.target.value})}
                >
                  <option value="" className="bg-neu-black">Select Industry</option>
                  <option value="Technology" className="bg-neu-black">Technology</option>
                  <option value="Finance" className="bg-neu-black">Finance</option>
                  <option value="Healthcare" className="bg-neu-black">Healthcare</option>
                  <option value="Education" className="bg-neu-black">Education</option>
                  <option value="Services" className="bg-neu-black">Services</option>
                  <option value="Manufacturing" className="bg-neu-black">Manufacturing</option>
                  <option value="Telecomm" className="bg-neu-black">Telecomm</option>
                  <option value="Food" className="bg-neu-black">Food</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Effective Date</label>
                <input 
                  required
                  type="date" 
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal text-neu-white transition-all"
                  value={formData.effectiveDate}
                  onChange={e => setFormData({...formData, effectiveDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Expiration Date</label>
                <input 
                  required
                  type="date" 
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal text-neu-white transition-all"
                  value={formData.expirationDate}
                  onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Status</label>
                <select 
                  required
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal uppercase tracking-widest text-xs text-neu-white cursor-pointer transition-all"
                  value={formData.moaStatus}
                  onChange={e => setFormData({...formData, moaStatus: e.target.value as MOAStatus})}
                >
                  <option value="APPROVED" className="bg-neu-black">Approved</option>
                  <option value="PROCESSING" className="bg-neu-black">Processing</option>
                  <option value="EXPIRED" className="bg-neu-black">Expired</option>
                  <option value="EXPIRING" className="bg-neu-black">Expiring</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">Endorsed By College</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-neu-orange outline-none font-normal uppercase tracking-tighter text-neu-white transition-all"
                  value={formData.endorsedByCollege}
                  onChange={e => setFormData({...formData, endorsedByCollege: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4 sticky bottom-0 bg-neu-black/50 backdrop-blur-md mt-auto">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl font-medium uppercase tracking-tighter text-white/40 bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-xl font-medium uppercase tracking-tighter text-neu-white bg-orange-gradient hover:opacity-90 transition-all shadow-2xl shadow-neu-orange/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : moa ? 'Update MOA' : 'Create MOA'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
