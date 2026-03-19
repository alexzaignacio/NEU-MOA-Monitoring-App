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
      
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesCollege = collegeFilter === 'all' || m.endorsedByCollege === collegeFilter;
      const matchesDeleted = showDeleted ? m.isDeleted : !m.isDeleted;

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
            className="fixed top-4 left-1/2 z-[100] flex items-center gap-3 bg-stone-900 text-white px-6 py-4 rounded-2xl shadow-2xl"
          >
            <CheckCircle2 size={20} className="text-emerald-400" />
            <span className="font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">MOA Records</h2>
          <p className="text-stone-500">Manage and track all Memoranda of Agreement.</p>
        </div>
        
        {canMaintain && (
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={20} />
            Add New MOA
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Search company, contact, or HTEID..." 
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            className="bg-stone-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PROCESSING">Processing</option>
            <option value="EXPIRED">Expired</option>
            <option value="EXPIRING">Expiring</option>
          </select>

          {isAdmin && (
            <button 
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                showDeleted ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-600'
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
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
          <div className="flex flex-col items-center">
            <FileText size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 font-medium">No MOA records found matching your criteria.</p>
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
    APPROVED: 'bg-emerald-100 text-emerald-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    EXPIRED: 'bg-red-100 text-red-700',
    EXPIRING: 'bg-amber-100 text-amber-700',
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${moa.companyName}?`)) {
      await softDeleteMOA(moa.id, moa.companyName);
      onToast('MOA moved to trash');
    }
  };

  const handleRecover = async () => {
    await recoverMOA(moa.id, moa.companyName);
    onToast('MOA restored successfully');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col ${moa.isDeleted ? 'opacity-75 grayscale' : ''}`}
    >
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[moa.status]}`}>
            {moa.status}
          </span>
          <div className="flex gap-1">
            {canEdit && !moa.isDeleted && (
              <button onClick={onEdit} className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                <Edit2 size={16} />
              </button>
            )}
            {isAdmin && (
              moa.isDeleted ? (
                <button onClick={handleRecover} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <RotateCcw size={16} />
                </button>
              ) : (
                <button onClick={handleDelete} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              )
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-stone-900 leading-tight mb-2">{moa.companyName}</h3>
        <p className="text-xs text-stone-500 font-mono mb-4 flex items-center gap-1">
          <Building size={12} /> {moa.hteid || 'NO HTEID'}
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-stone-600">
            <MapPin size={16} className="mt-0.5 text-stone-400 shrink-0" />
            <span className="line-clamp-2">{moa.companyAddress}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600">
            <UserIcon size={16} className="text-stone-400 shrink-0" />
            <span>{moa.contactPerson}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600">
            <Mail size={16} className="text-stone-400 shrink-0" />
            <span className="truncate">{moa.contactPersonEmail}</span>
          </div>
        </div>
      </div>

      {!isStudent && (
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            Effective: {moa.effectiveDate}
          </div>
          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            College: {moa.endorsedByCollege}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const MOAForm: React.FC<{ 
  moa: MOA | null, 
  onClose: () => void,
  onSuccess: (msg: string) => void
}> = ({ moa, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<MOA>>(
    moa || {
      companyName: '',
      companyAddress: '',
      contactPerson: '',
      contactPersonEmail: '',
      industryType: '',
      effectiveDate: format(new Date(), 'yyyy-MM-dd'),
      expirationDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'PROCESSING',
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
        onSuccess('MOA updated successfully');
      } else {
        await createMOA(formData);
        onSuccess('MOA created successfully');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving MOA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <h3 className="text-2xl font-bold">{moa ? 'Edit MOA Entry' : 'New MOA Entry'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Company Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Company Address</label>
              <textarea 
                required
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                value={formData.companyAddress}
                onChange={e => setFormData({...formData, companyAddress: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Contact Person</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.contactPerson}
                onChange={e => setFormData({...formData, contactPerson: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Contact Email</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.contactPersonEmail}
                onChange={e => setFormData({...formData, contactPersonEmail: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">HTEID</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.hteid}
                onChange={e => setFormData({...formData, hteid: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Industry Type</label>
              <select 
                required
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.industryType}
                onChange={e => setFormData({...formData, industryType: e.target.value})}
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Services">Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Telecomm">Telecomm</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Effective Date</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.effectiveDate}
                onChange={e => setFormData({...formData, effectiveDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Expiration Date</label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.expirationDate}
                onChange={e => setFormData({...formData, expirationDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Status</label>
              <select 
                required
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as MOAStatus})}
              >
                <option value="APPROVED">Approved</option>
                <option value="PROCESSING">Processing</option>
                <option value="EXPIRED">Expired</option>
                <option value="EXPIRING">Expiring</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Endorsed By College</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500"
                value={formData.endorsedByCollege}
                onChange={e => setFormData({...formData, endorsedByCollege: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
            >
              {loading ? 'Saving...' : moa ? 'Update MOA' : 'Create MOA'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
