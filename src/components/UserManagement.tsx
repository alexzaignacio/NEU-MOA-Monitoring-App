import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Ban, 
  CheckCircle, 
  MoreVertical,
  GraduationCap,
  Briefcase,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-stone-500 mt-1">Manage system access and assign roles.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Permissions</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold">
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{user.displayName || 'Unnamed User'}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-stone-100 border-none rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.uid, e.target.value as UserRole)}
                      disabled={user.email === 'admin@neu.edu.ph'}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.isBlocked ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                        <Ban size={10} /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle size={10} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'faculty' && (
                      <button 
                        onClick={() => handleToggleMaintain(user.uid, !!user.canMaintainMOA)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                          user.canMaintainMOA 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        Maintain MOA: {user.canMaintainMOA ? 'ON' : 'OFF'}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.email !== 'admin@neu.edu.ph' && (
                      <button 
                        onClick={() => handleToggleBlock(user.uid, !!user.isBlocked)}
                        className={`p-2 rounded-xl transition-all ${
                          user.isBlocked 
                            ? 'text-emerald-600 hover:bg-emerald-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.isBlocked ? 'Unblock User' : 'Block User'}
                      >
                        {user.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                      </button>
                    )}
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
