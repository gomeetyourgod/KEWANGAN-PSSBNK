
import React, { useState } from 'react';
import { Member, PaymentRecord, Transaction } from '../types';
import { geminiService } from '../services/geminiService';

interface AIAssistantProps {
  members: Member[];
  payments: PaymentRecord[];
  transactions: Transaction[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ members, payments, transactions }) => {
  const [report, setReport] = useState<string | null>(null);
  const [annualReport, setAnnualReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAnnual, setLoadingAnnual] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    const result = await geminiService.generateFinancialReport(members, payments, transactions);
    setReport(result || null);
    setLoading(false);
  };

  const generateAnnualReport = async () => {
    setLoadingAnnual(true);
    const result = await geminiService.generateAnnualReport(transactions);
    setAnnualReport(result || null);
    setLoadingAnnual(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
           </svg>
        </div>

        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Penasihat Kewangan AI</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            Gunakan kecerdasan buatan untuk menganalisis prestasi kutipan yuran ahli, baki tunai, dan strategi bajet.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={generateReport}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Menganalisis...' : 'Jana Laporan Strategik'}
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button 
              onClick={generateAnnualReport}
              disabled={loadingAnnual}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingAnnual ? 'Menjana Laporan Tahunan...' : 'Laporan Kewangan Tahunan'}
              {!loadingAnnual && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {report && (
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                  Analisis Strategik Tunai
                </h4>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                  {report.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {annualReport && (
              <div className="bg-indigo-900/30 p-6 rounded-2xl border border-indigo-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                <h4 className="font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
                  Laporan Ringkas Tahunan
                </h4>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {annualReport}
                </div>
                <button 
                  onClick={() => {
                    const blob = new Blob([annualReport], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Laporan_Tahunan_Silat_${new Date().getFullYear()}.txt`;
                    a.click();
                  }}
                  className="mt-6 text-xs text-indigo-300 hover:text-indigo-100 font-bold underline decoration-dotted"
                >
                  Muat Turun Laporan (.txt)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
