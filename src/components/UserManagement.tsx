import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Ban, 
  CheckCircle, 
  MoreVertical,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'alexzagayle.ignacio@neu.edu.ph'];
  const isProtectedAdmin = (email: string) => ADMIN_EMAILS.includes(email);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (uid: string, role: UserRole) => {
    await updateDoc(doc(db, 'users', uid), { role });
  };

  const handleToggleBlock = async (uid: string, isBlocked: boolean) => {
    await updateDoc(doc(db, 'users', uid), { isBlocked: !isBlocked });
  };

  const handleToggleMaintain = async (uid: string, canMaintain: boolean) => {
    await updateDoc(doc(db, 'users', uid), { canMaintainMOA: !canMaintain });
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user ${email}?`)) {
      await deleteDoc(doc(db, 'users', uid));
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-5xl font-medium tracking-tighter text-neu-white uppercase leading-none">User Management</h2>
        <p className="text-white/40 font-medium uppercase tracking-widest text-xs mt-2">Manage system access and assign roles.</p>
      </header>

      <div className="glass-card rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-gradient border-b border-white/10 text-neu-white">
                <th className="px-8 py-6 text-[10px] font-medium uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] font-medium uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-[10px] font-medium uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-medium uppercase tracking-widest">Permissions</th>
                <th className="px-8 py-6 text-[10px] font-medium uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-white/5 transition-all duration-300 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-gradient flex items-center justify-center text-neu-white font-medium shadow-xl shadow-neu-orange/20 group-hover:scale-105 transition-transform">
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-normal text-neu-white uppercase tracking-tighter text-lg leading-none mb-1">{user.displayName || 'Unnamed User'}</p>
                        <p className="text-xs text-white/40 font-normal uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      className="bg-white/5 border-none rounded-xl px-4 py-2 text-xs font-medium uppercase tracking-widest focus:ring-2 focus:ring-neu-orange disabled:opacity-50 text-neu-white cursor-pointer"
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                      disabled={isProtectedAdmin(user.email) || user.uid === currentUser?.uid}
                    >
                      <option value="student" className="bg-neu-black">Student</option>
                      <option value="faculty" className="bg-neu-black">Faculty</option>
                      <option value="admin" className="bg-neu-black">Admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    {user.isBlocked ? (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-500 text-[10px] font-medium uppercase tracking-widest border border-red-500/30">
                        <Ban size={12} /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neu-orange/20 text-neu-orange text-[10px] font-medium uppercase tracking-widest border border-neu-orange/30">
                        <CheckCircle size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {user.role === 'faculty' && (
                      <button 
                        onClick={() => handleToggleMaintain(user.uid, !!user.canMaintainMOA)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-widest transition-all border ${
                          user.canMaintainMOA 
                            ? 'bg-neu-orange/20 text-neu-orange border-neu-orange/30' 
                            : 'bg-white/5 text-white/20 border-white/5 hover:text-white/40'
                        }`}
                      >
                        Maintain MOA: {user.canMaintainMOA ? 'ON' : 'OFF'}
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      {!isProtectedAdmin(user.email) && user.uid !== currentUser?.uid && (
                        <>
                          <button 
                            onClick={() => handleToggleBlock(user.uid, !!user.isBlocked)}
                            className={`p-3 rounded-xl transition-all border ${
                              user.isBlocked 
                                ? 'text-neu-orange bg-neu-orange/10 border-neu-orange/20 hover:bg-neu-orange/20' 
                                : 'text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
                            }`}
                            title={user.isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {user.isBlocked ? <CheckCircle size={20} /> : <Ban size={20} />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.uid, user.email)}
                            className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
