
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Member } from '../types';
import { CATEGORIES, MONTHS } from '../constants';

interface TransactionLedgerProps {
  members: Member[];
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({ members, transactions, onAddTransaction, onDeleteTransaction }) => {
  const [isAdding, setIsAdding] = useState(false);
  
  // State for Filters
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    type: 'ALL' as 'ALL' | TransactionType,
    category: 'ALL',
    memberId: 'ALL'
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'IN' as TransactionType,
    category: CATEGORIES.IN[0],
    amount: 0,
    description: '',
    relatedMemberId: '',
    relatedMonth: new Date().getMonth()
  });

  // Safe sorted members for selects
  const sortedMembersSelect = useMemo(() => {
    return [...members].sort((a, b) => (parseInt(a.memberNumber) || 0) - (parseInt(b.memberNumber) || 0));
  }, [members]);

  // Auto-update description logic
  useEffect(() => {
    if (formData.category === 'Yuran Bulanan' && formData.type === 'IN') {
      const member = members.find(m => m.id === formData.relatedMemberId);
      const monthName = MONTHS[formData.relatedMonth];
      const newDesc = `Yuran ${monthName} - ${member ? member.name : 'Pilih Ahli'}`;
      if (formData.description !== newDesc) {
        setFormData(prev => ({ ...prev, description: newDesc }));
      }
    }
  }, [formData.category, formData.relatedMemberId, formData.relatedMonth, formData.type, members]);

  // Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const member = t.relatedMemberId ? members.find(m => m.id === t.relatedMemberId) : null;
      const searchMatch = 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) || 
        (member && member.memberNumber.includes(filters.search));

      const memberMatch = filters.memberId === 'ALL' || t.relatedMemberId === filters.memberId;

      const dateMatch = 
        (!filters.startDate || t.date >= filters.startDate) && 
        (!filters.endDate || t.date <= filters.endDate);

      const typeMatch = filters.type === 'ALL' || t.type === filters.type;
      const categoryMatch = filters.category === 'ALL' || t.category === filters.category;

      return searchMatch && memberMatch && dateMatch && typeMatch && categoryMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters, members]);

  // Dynamic Totals based on Filtered Results
  const filteredTotals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'IN') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return alert('Tiada rekod untuk dieksport');
    const headers = ['Tarikh', 'Jenis', 'Kategori', 'No. Ahli', 'Nota/Deskripsi', 'Jumlah (RM)'];
    const rows = filteredTransactions.map(t => {
      const member = t.relatedMemberId ? members.find(m => m.id === t.relatedMemberId) : null;
      return [
        new Date(t.date).toLocaleDateString('ms-MY'),
        t.type === 'IN' ? 'MASUK' : 'KELUAR',
        t.category,
        member ? `#${member.memberNumber}` : '-',
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount.toFixed(2)
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Rekod_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return alert('Jumlah mesti lebih daripada 0');
    if (formData.category === 'Yuran Bulanan' && !formData.relatedMemberId) {
      return alert('Sila pilih No. Ahli untuk kategori Yuran Bulanan');
    }
    onAddTransaction(formData);
    setIsAdding(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'IN',
      category: CATEGORIES.IN[0],
      amount: 0,
      description: '',
      relatedMemberId: '',
      relatedMonth: new Date().getMonth()
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '', startDate: '', endDate: '', type: 'ALL', category: 'ALL', memberId: 'ALL'
    });
  };

  // Shared Styles
  const filterControlClass = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm transition-all";
  const formInputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm";
  const formLabelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Buku Tunai (Ledger)</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={handleExportCSV} className="flex-1 md:flex-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            CSV
          </button>
          <button onClick={() => setIsAdding(!isAdding)} className="flex-1 md:flex-none bg-slate-900 dark:bg-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-sm font-medium">
            {isAdding ? 'Batal' : 'Tambah Rekod'}
          </button>
        </div>
      </div>

      {/* Ringkasan Jumlah Dinamik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jumlah Masuk</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">RM {filteredTotals.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl text-rose-600 dark:text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jumlah Keluar</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">RM {filteredTotals.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Baki Bersih</p>
            <p className={`text-lg font-bold ${filteredTotals.income - filteredTotals.expense >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
              RM {(filteredTotals.income - filteredTotals.expense).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
          <div className="col-span-2 md:col-span-1">
            <input type="text" placeholder="Cari nota..." className={filterControlClass} value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
          <div className="col-span-1">
            <select className={filterControlClass} value={filters.memberId} onChange={e => setFilters({...filters, memberId: e.target.value})}>
              <option value="ALL">Pilih Ahli</option>
              {sortedMembersSelect.map(m => (
                <option key={m.id} value={m.id}>#{m.memberNumber} - {m.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <input type="date" className={filterControlClass} value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div className="col-span-1">
            <input type="date" className={filterControlClass} value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
          <div className="col-span-1">
            <select className={filterControlClass} value={filters.type} onChange={e => setFilters({...filters, type: e.target.value as any, category: 'ALL'})}>
              <option value="ALL">Semua Jenis</option>
              <option value="IN">Duit Masuk</option>
              <option value="OUT">Duit Keluar</option>
            </select>
          </div>
          <div className="col-span-1">
            <select className={filterControlClass} value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
              <option value="ALL">Kategori</option>
              {filters.type !== 'OUT' && CATEGORIES.IN.map(c => <option key={c} value={c}>{c}</option>)}
              {filters.type !== 'IN' && CATEGORIES.OUT.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center">
             <button onClick={resetFilters} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 font-bold w-full transition-all">RESET</button>
          </div>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className={formLabelClass}>Jenis Transaksi</label>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
                <button type="button" onClick={() => setFormData({...formData, type: 'IN', category: CATEGORIES.IN[0]})} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.type === 'IN' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Masuk</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'OUT', category: CATEGORIES.OUT[0]})} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.type === 'OUT' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Keluar</button>
              </div>
            </div>
            <div>
              <label className={formLabelClass}>Tarikh Transaksi</label>
              <input type="date" required className={formInputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className={formLabelClass}>Kategori</label>
              <select className={formInputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {CATEGORIES[formData.type].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {formData.category === 'Yuran Bulanan' && (
              <>
                <div className="animate-in zoom-in duration-200">
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1.5 uppercase tracking-widest">Pembayar (Ahli)</label>
                  <select required className={`${formInputClass} border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30`} value={formData.relatedMemberId} onChange={e => setFormData({...formData, relatedMemberId: e.target.value})}>
                    <option value="">Pilih Ahli</option>
                    {sortedMembersSelect.map(m => <option key={m.id} value={m.id}>#{m.memberNumber} - {m.name}</option>)}
                  </select>
                </div>
                <div className="animate-in zoom-in duration-200">
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1.5 uppercase tracking-widest">Bulan Yuran</label>
                  <select required className={`${formInputClass} border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30`} value={formData.relatedMonth} onChange={e => setFormData({...formData, relatedMonth: parseInt(e.target.value)})}>
                    {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className={formLabelClass}>Jumlah (RM)</label>
              <input type="number" step="0.01" required className={`${formInputClass} font-mono font-bold`} placeholder="0.00" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
            </div>
            <div className="lg:col-span-2">
              <label className={formLabelClass}>Nota / Penerangan</label>
              <input type="text" className={formInputClass} placeholder="Contoh: Pembayaran yuran penuh..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-xl hover:bg-indigo-700 transition-all font-black shadow-lg text-sm uppercase tracking-widest active:scale-95">
              Simpan Rekod
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Tarikh</th>
                <th className="px-6 py-4">Jenis</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Tiada transaksi dijumpai untuk kriteria ini.</td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('ms-MY')}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.type === 'IN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>{t.type === 'IN' ? 'MASUK' : 'KELUAR'}</span></td>
                    <td className="px-6 py-4 font-medium">
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-slate-100">{t.category}</span>
                        <span className="text-[10px] text-slate-400 font-normal truncate max-w-[250px]">{t.description}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>RM {t.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      {!t.relatedPaymentId && (
                        <button onClick={() => onDeleteTransaction(t.id)} className="text-rose-400 hover:text-rose-600 p-1 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      {t.relatedPaymentId && <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase">Auto</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionLedger;
