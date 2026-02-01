
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
  
  // States
  const [isEditing, setIsEditing] = useState(false);
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
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Rekod Yuran Sesi ({currentYear})
            {isEditing && (
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </h2>
          <p className="text-sm text-slate-500">
            Status: {isEditing ? (
              <span className="text-rose-600 font-bold uppercase tracking-wider text-xs">Mod Kemaskini Aktif</span>
            ) : (
              <span className="text-slate-400 font-medium">Mod Paparan Sahaja (Dikunci)</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Action Buttons */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
              isEditing 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isEditing ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                SIMPAN & KUNCI
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                PINDA REKOD
              </>
            )}
          </button>

          {/* Filters Wrapper */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            <select 
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="bg-slate-50 border-none text-xs font-bold text-slate-700 py-2 px-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-50 border-none text-xs font-bold text-slate-700 py-2 px-3 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="ALL">Semua</option>
              <option value="PAID">Berbayar</option>
              <option value="UNPAID">Tunggakan</option>
            </select>

            {isFiltered && (
              <button 
                onClick={handleResetFilters}
                className="text-[10px] bg-slate-100 text-slate-500 px-3 py-2 rounded-lg hover:bg-slate-200 font-bold transition-all"
              >
                ASAL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${isEditing ? 'border-rose-200 ring-4 ring-rose-50' : 'border-slate-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-5 sticky left-0 bg-slate-50 z-10 w-56 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">Butiran Ahli</th>
                <th className="px-4 py-5 text-center font-bold text-indigo-600 bg-indigo-50/30">Terima</th>
                <th className="px-4 py-5 text-center font-bold text-rose-600 bg-rose-50/30">Baki</th>
                {MONTHS.map((m, idx) => (
                  <th 
                    key={m} 
                    className={`px-2 py-5 text-center font-bold transition-colors ${idx === filterMonth ? 'bg-amber-100 text-amber-800' : ''}`}
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
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Member Info */}
                      <td className="px-6 py-5 font-medium text-slate-900 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-black text-white bg-slate-900 px-2 py-0.5 rounded shadow-sm">
                              #{member.memberNumber}
                            </span>
                            <span className="text-sm font-bold truncate max-w-[140px] text-slate-800">{member.name}</span>
                          </div>
                          {!isEditing && (
                            <button 
                              onClick={() => handleGenerateReminder(member.name, filterMonth)}
                              className="text-[10px] text-indigo-500 hover:text-indigo-700 mt-2 font-bold flex items-center gap-1 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                              </svg>
                              Hantar Peringatan ({MONTHS[filterMonth].slice(0, 3)})
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Stats Columns */}
                      <td className="px-4 py-5 text-center border-x border-slate-50 bg-indigo-50/10">
                        <span className="text-xs font-black text-indigo-700">
                          RM {paidAmount}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center border-r border-slate-50 bg-rose-50/10">
                        <span className={`inline-block px-2 py-1 rounded-lg text-[11px] font-black ${
                          balance > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
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
                          <td key={idx} className={`px-1.5 py-5 text-center transition-colors ${isFilteredIdx ? 'bg-amber-50/40' : ''}`}>
                            {isBeforeJoining ? (
                              <div className="w-9 h-9 mx-auto flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                              </div>
                            ) : (
                              <button
                                disabled={!isEditing}
                                onClick={() => onTogglePayment(member.id, idx, currentYear)}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all transform ${
                                  status === 'PAID' 
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:scale-110 active:scale-90' 
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200 active:scale-95'
                                } ${!isEditing ? 'cursor-default opacity-80' : 'cursor-pointer hover:ring-2 hover:ring-indigo-300'} ${isFilteredIdx && isEditing && status === 'UNPAID' ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                                title={isEditing ? 'Klik untuk tukar status' : 'Mod Paparan Sahaja'}
                              >
                                {status === 'PAID' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className="text-[10px] font-black uppercase">{isEditing ? 'BAYAR' : 'RM'}</span>
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

      {/* Helper Note for Editing */}
      {isEditing && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
          <div className="bg-rose-500 text-white p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-rose-800">Mod Kemaskini Aktif</p>
            <p className="text-xs text-rose-600">Setiap "tick" atau "untick" akan menjana atau memadam transaksi secara automatik di Dashboard dan Ledger. Sila pastikan anda klik <strong>Simpan & Kunci</strong> setelah selesai.</p>
          </div>
        </div>
      )}

      {/* AI Reminder Box */}
      {reminder && (
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 animate-in fade-in zoom-in duration-300 shadow-xl shadow-indigo-100/50">
          <div className="flex justify-between items-start mb-4">
            <h5 className="font-bold text-indigo-900 flex items-center gap-3">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              Draf Peringatan AI ({MONTHS[filterMonth]})
            </h5>
            <button onClick={() => setReminder(null)} className="bg-white p-1 rounded-full text-indigo-300 hover:text-indigo-600 border border-indigo-100 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-indigo-800 font-sans bg-white p-5 rounded-2xl border border-indigo-100 shadow-inner leading-relaxed border-l-4 border-l-indigo-500">
            {reminder}
          </pre>
          <div className="mt-4 flex gap-2">
             <button 
              onClick={() => {
                navigator.clipboard.writeText(reminder);
                alert('Teks disalin! Anda boleh tampal di WhatsApp.');
              }}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Salin Mesej
            </button>
          </div>
        </div>
      )}

      {loadingReminder && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-sm font-bold text-slate-500">AI sedang menjana mesej peringatan terbaik...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMatrix;
