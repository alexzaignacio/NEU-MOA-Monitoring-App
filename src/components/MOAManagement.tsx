import React, { useState, useMemo } from 'react';
import { MOA, MOAStatus } from '../types';
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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { createMOA, updateMOA, softDeleteMOA, recoverMOA } from '../services/moaService';

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
  const [showDeleted, setShowDeleted] = useState(false);
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
      const isDeleted = m.status === 'deleted' || m.isDeleted;
      
      // If showDeleted is true (Admin only), show ONLY deleted.
      // Otherwise, show ONLY active.
      // Faculty never see deleted.
      const matchesDeleted = (isAdmin && showDeleted) ? isDeleted : !isDeleted;

      return matchesSearch && matchesStatus && matchesCollege && matchesDeleted;
    });
  }, [moas, searchTerm, statusFilter, collegeFilter, showDeleted]);

  const handleOpenForm = (moa?: MOA) => {
    if (moa) setEditingMOA(moa);
    else setEditingMOA(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 relative">
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
            <span className="font-black uppercase tracking-tighter">{toast.message}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMOAs.map((moa) => (
            <MOACard 
              key={moa.id} 
              moa={moa} 
              onEdit={() => handleOpenForm(moa)}
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
    </div>
  );
};

const MOACard: React.FC<{ 
  moa: MOA, 
  onEdit: () => void, 
  canEdit: boolean, 
  isAdmin: boolean,
  onToast: (msg: string) => void
}> = ({ moa, onEdit, canEdit, isAdmin, onToast }) => {
  const { isStudent } = useAuth();
  
  const statusColors = {
    APPROVED: 'bg-neu-orange/20 text-neu-orange border-neu-orange/30',
    PROCESSING: 'bg-white/10 text-white/60 border-white/20',
    EXPIRED: 'bg-red-500/20 text-red-500 border-red-500/30',
    EXPIRING: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${moa.companyName}?`)) {
      await softDeleteMOA(moa.id, moa.companyName);
      onToast('MOA MOVED TO TRASH');
    }
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
      className={`glass-card rounded-[2rem] border-white/5 hover:border-white/20 transition-all duration-500 group overflow-hidden flex flex-col ${(moa.status === 'deleted' || moa.isDeleted) ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-6">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest border ${statusColors[moa.moaStatus]}`}>
            {moa.moaStatus}
          </span>
          <div className="flex gap-2">
            {canEdit && !(moa.status === 'deleted' || moa.isDeleted) && (
              <>
                <button onClick={onEdit} className="p-2.5 text-white/20 hover:text-neu-white hover:bg-white/10 rounded-xl transition-all">
                  <Edit2 size={18} />
                </button>
                <button onClick={handleDelete} className="p-2.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </>
            )}
            {isAdmin && (moa.status === 'deleted' || moa.isDeleted) && (
              <button onClick={handleRecover} className="p-2.5 text-white/20 hover:text-neu-orange hover:bg-neu-orange/10 rounded-xl transition-all">
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
