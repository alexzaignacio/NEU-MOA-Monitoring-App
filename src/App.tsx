import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MOAManagement } from './components/MOAManagement';
import { UserManagement } from './components/UserManagement';
import { AuditTrail } from './components/AuditTrail';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { ErrorBoundary } from './components/ErrorBoundary';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, getDocFromServer, doc, where } from 'firebase/firestore';
import { MOA } from './types';
import { ShieldAlert, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [moas, setMoas] = useState<MOA[]>([]);
  const [moasLoading, setMoasLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    if (!user || profile?.isBlocked) return;

    let q = query(collection(db, 'moa_records'), orderBy('createdAt', 'desc'));
    
    // If not admin, strictly filter for active status at the query level
    if (!isAdmin) {
      q = query(
        collection(db, 'moa_records'), 
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MOA));
      setMoas(moasData);
      setMoasLoading(false);
    }, (error) => {
      console.error("Error fetching MOAs:", error);
      setMoasLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile?.isBlocked, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const ADMIN_EMAILS = ['jcesperanza@neu.edu.ph', 'alexzagayle.ignacio@neu.edu.ph'];
  const isProtectedAdmin = profile && ADMIN_EMAILS.includes(profile.email);

  if (profile?.isBlocked && !isProtectedAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md border border-red-100">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-medium text-stone-900 mb-4">Access Restricted</h1>
          <p className="text-stone-500 mb-8">Your account has been blocked from accessing the system. Please contact the administrator for more information.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard moas={moas} />;
      case 'moas':
        return <MOAManagement moas={moas} />;
      case 'users':
        return isAdmin ? <UserManagement /> : <Dashboard moas={moas} />;
      case 'audit':
        return isAdmin ? <AuditTrail /> : <Dashboard moas={moas} />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard moas={moas} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
