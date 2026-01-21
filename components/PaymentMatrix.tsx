
import React, { useState, useMemo } from 'react';
import { Member, PaymentRecord } from '../types';
import { MONTHS, MONTHLY_FEE } from '../constants';
import { geminiService } from '../services/geminiService';

interface PaymentMatrixProps {
  members: Member[];
  payments: PaymentRecord[];
  onTogglePayment: (memberId: string, month: number, year: number) => void;
}

const PaymentMatrix: React.FC<PaymentMatrixProps> = ({ members, payments, onTogglePayment }) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();
  
  // States for Filtering
  const [filterMonth, setFilterMonth] = useState(currentMonthIdx);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  
  const [reminder, setReminder] = useState<string | null>(null);
  const [loadingReminder, setLoadingReminder] = useState(false);

  // Sasaran sesi: RM 150 (5 kali bayaran RM 30)
  const SESSION_TARGET = 150;

  const getStatus = (memberId: string, month: number) => {
    return payments.find(p => p.memberId === memberId && p.month === month && p.year === currentYear)?.status || 'UNPAID';
  };

  const calculateStats = (memberId: string) => {
    const paidMonthsCount = MONTHS.reduce((count, _, idx) => {
      const status = getStatus(memberId, idx);
      return status === 'PAID' ? count + 1 : count;
    }, 0);

    const paidAmount = paidMonthsCount * MONTHLY_FEE;
    const balance = Math.max(0, SESSION_TARGET - paidAmount);
    
    return { paidAmount, balance };
  };

  // Filtered members logic
  const filteredMembers = useMemo(() => {
    return members
      .filter(member => {
        if (filterStatus === 'ALL') return true;
        const status = getStatus(member.id, filterMonth);
        return status === filterStatus;
      })
      .sort((a, b) => parseInt(a.memberNumber) - parseInt(b.memberNumber));
  }, [members, payments, filterMonth, filterStatus, currentYear]);

  const handleResetFilters = () => {
    setFilterMonth(currentMonthIdx);
    setFilterStatus('ALL');
  };

  const isFiltered = filterMonth !== currentMonthIdx || filterStatus !== 'ALL';

  const handleGenerateReminder = async (memberName: string, monthIdx: number) => {
    setLoadingReminder(true);
    const msg = await geminiService.generateReminderMessage(memberName, MONTHS[monthIdx]);
    setReminder(msg);
    setLoadingReminder(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekod Yuran Sesi ({currentYear})</h2>
          <p className="text-sm text-slate-500">
            Sasaran Sesi: <span className="font-bold text-indigo-600">RM {SESSION_TARGET}</span>. Pantau kutipan dan tunggakan ahli.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full lg:w-auto">
          <div className="flex items-center gap-2 px-2 border-r border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tapis</span>
          </div>
          
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
            className="bg-slate-50 border-none text-xs font-bold text-slate-700 py-1.5 px-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 border-none text-xs font-bold text-slate-700 py-1.5 px-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="ALL">Semua Status</option>
            <option value="PAID">Sudah Bayar</option>
            <option value="UNPAID">Belum Bayar</option>
          </select>

          {isFiltered && (
            <button 
              onClick={handleResetFilters}
              className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-bold transition-all animate-in fade-in zoom-in duration-200"
            >
              RESET
            </button>
          )}

          <div className="ml-auto lg:ml-0 px-2">
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
              {filteredMembers.length} Ahli
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-4 sticky left-0 bg-slate-50 z-10 w-48 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">Ahli</th>
                <th className="px-4 py-4 text-center font-bold text-indigo-600 bg-indigo-50/30">Dibayar</th>
                <th className="px-4 py-4 text-center font-bold text-rose-600 bg-rose-50/30">Baki Sesi</th>
                {MONTHS.map((m, idx) => (
                  <th 
                    key={m} 
                    className={`px-2 py-4 text-center font-semibold ${idx === filterMonth ? 'bg-amber-50 text-amber-700' : ''}`}
                  >
                    {m.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={MONTHS.length + 3} className="px-6 py-12 text-center text-slate-400 italic">
                    Tiada ahli dijumpai untuk kriteria tapisan ini.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => {
                  const { paidAmount, balance } = calculateStats(member.id);
                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      {/* Member Info */}
                      <td className="px-4 py-4 font-medium text-slate-900 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              #{member.memberNumber}
                            </span>
                            <span className="text-sm font-semibold truncate max-w-[120px]">{member.name}</span>
                          </div>
                          <button 
                            onClick={() => handleGenerateReminder(member.name, filterMonth)}
                            className="text-[10px] text-indigo-500 hover:underline text-left mt-1.5 font-medium"
                          >
                            Peringatan {MONTHS[filterMonth]}
                          </button>
                        </div>
                      </td>

                      {/* Stats Columns */}
                      <td className="px-4 py-4 text-center border-x border-slate-50 bg-indigo-50/10">
                        <span className="text-xs font-bold text-indigo-700">
                          RM {paidAmount}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center border-r border-slate-50 bg-rose-50/10">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          balance > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          RM {balance}
                        </span>
                      </td>

                      {/* Monthly Dots */}
                      {MONTHS.map((_, idx) => {
                        const status = getStatus(member.id, idx);
                        const joinDate = new Date(member.joinDate);
                        const isBeforeJoining = currentYear < joinDate.getFullYear() || (currentYear === joinDate.getFullYear() && idx < joinDate.getMonth());
                        const isFilteredIdx = idx === filterMonth;
                        
                        return (
                          <td key={idx} className={`px-1 py-4 text-center ${isFilteredIdx ? 'bg-amber-50/30' : ''}`}>
                            {isBeforeJoining ? (
                              <div className="w-8 h-8 mx-auto flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                              </div>
                            ) : (
                              <button
                                onClick={() => onTogglePayment(member.id, idx, currentYear)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                  status === 'PAID' 
                                    ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                } ${isFilteredIdx && status === 'UNPAID' ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
                              >
                                {status === 'PAID' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className="text-[10px] font-bold">RM</span>
                                )}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Reminder Box */}
      {reminder && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-start mb-4">
            <h5 className="font-bold text-indigo-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              Draf Peringatan AI ({MONTHS[filterMonth]})
            </h5>
            <button onClick={() => setReminder(null)} className="text-indigo-400 hover:text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-indigo-800 font-sans bg-white p-4 rounded-xl border border-indigo-200 shadow-inner leading-relaxed">
            {reminder}
          </pre>
          <div className="mt-4 flex gap-2">
             <button 
              onClick={() => {
                navigator.clipboard.writeText(reminder);
                alert('Teks disalin ke papan klip!');
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Salin Mesej
            </button>
          </div>
        </div>
      )}

      {loadingReminder && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default PaymentMatrix;
