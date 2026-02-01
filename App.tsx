
import React, { useState, useEffect, useCallback } from 'react';
import { Member, PaymentRecord, Transaction, User } from './types';
import { MONTHLY_FEE, MONTHS } from './constants';
import { authService } from './services/authService';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import PaymentMatrix from './components/PaymentMatrix';
import TransactionLedger from './components/TransactionLedger';
import AIAssistant from './components/AIAssistant';
import LoginForm from './components/LoginForm';

const STORAGE_KEY = 'silat_management_v2';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'payments' | 'ledger' | 'ai'>('dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      setUser(session.user);
    }
    setIsAppLoading(false);
  }, []);

  // Load data from localStorage
  useEffect(() => {
    if (!user) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data) {
          setMembers(data.members || []);
          setPayments(data.payments || []);
          setTransactions(data.transactions || []);
        }
      } catch (e) {
        console.error("Gagal memuatkan data:", e);
      }
    } else {
      const initialMembers: Member[] = [
        { id: '1', name: 'Ahmad bin Zulkifli', icNumber: '900101-14-5543', memberNumber: '1', phone: '012-3456789', joinDate: '2023-01-15' },
        { id: '2', name: 'Siti Norhaliza', icNumber: '920520-10-5002', memberNumber: '2', phone: '013-9876543', joinDate: '2023-05-20' },
        { id: '3', name: 'Mohd Razif', icNumber: '880210-08-6677', memberNumber: '3', phone: '017-1122334', joinDate: '2024-02-10' }
      ];
      setMembers(initialMembers);
    }
  }, [user]);

  // Simpan data setiap kali ada perubahan
  useEffect(() => {
    if (!user) return;
    const dataToSave = { members, payments, transactions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [members, payments, transactions, user]);

  const addMember = useCallback((newMember: Omit<Member, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setMembers(prev => [...prev, { ...newMember, id }]);
  }, []);

  const updateMember = useCallback((updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setPayments(prev => prev.filter(p => p.memberId !== id));
    setTransactions(prev => prev.filter(t => t.relatedMemberId !== id));
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setTransactions(prev => [...prev, { ...t, id }]);
  }, []);

  const updateTransaction = useCallback((updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const togglePayment = (memberId: string, month: number, year: number) => {
    const paymentId = `${memberId}-${month}-${year}`;
    const targetMember = members.find(m => m.id === memberId);
    
    setPayments(prev => {
      const existingIndex = prev.findIndex(p => p.memberId === memberId && p.month === month && p.year === year);
      const newPayments = [...prev];

      if (existingIndex > -1) {
        const isNowUnpaid = newPayments[existingIndex].status === 'PAID';
        newPayments[existingIndex].status = isNowUnpaid ? 'UNPAID' : 'PAID';
        
        if (isNowUnpaid) {
          setTransactions(tPrev => tPrev.filter(t => t.relatedPaymentId !== paymentId));
        } else {
          addTransaction({
            date: new Date().toISOString().split('T')[0],
            type: 'IN',
            category: 'Yuran Bulanan',
            amount: MONTHLY_FEE,
            description: `Yuran ${MONTHS[month]} - ${targetMember?.name}`,
            relatedMemberId: memberId,
            relatedMonth: month,
            relatedPaymentId: paymentId
          });
        }
        return newPayments;
      } else {
        const newRecord: PaymentRecord = {
          memberId,
          month,
          year,
          amount: MONTHLY_FEE,
          paidDate: new Date().toISOString(),
          status: 'PAID'
        };
        
        addTransaction({
          date: new Date().toISOString().split('T')[0],
          type: 'IN',
          category: 'Yuran Bulanan',
          amount: MONTHLY_FEE,
          description: `Yuran ${MONTHS[month]} - ${targetMember?.name}`,
          relatedMemberId: memberId,
          relatedMonth: month,
          relatedPaymentId: paymentId
        });
        
        return [...prev, newRecord];
      }
    });
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Sistem Kewangan <span className="text-indigo-600">Silat</span>
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-1 items-center">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'members', label: 'Ahli' },
                { id: 'payments', label: 'Yuran' },
                { id: 'ledger', label: 'Transaksi' },
                { id: 'ai', label: 'AI Penasihat' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              
              <div className="h-6 w-px bg-slate-200 mx-4"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-slate-900">{user.username}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <button 
                  onClick={() => authService.logout()}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Log Keluar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-500">
          {activeTab === 'dashboard' && <Dashboard members={members} payments={payments} transactions={transactions} />}
          {activeTab === 'members' && <MemberList members={members} onAdd={addMember} onUpdate={updateMember} onDelete={deleteMember} />}
          {activeTab === 'payments' && <PaymentMatrix members={members} payments={payments} onTogglePayment={togglePayment} />}
          {activeTab === 'ledger' && <TransactionLedger members={members} transactions={transactions} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} />}
          {activeTab === 'ai' && <AIAssistant members={members} payments={payments} transactions={transactions} />}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Sistem Pengurusan Kewangan Silat Melayu. Pengguna: {user.username}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
