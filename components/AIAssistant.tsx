
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
  const [cashFlowReport, setCashFlowReport] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [loadingCashFlow, setLoadingCashFlow] = useState(false);

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

  const generateCashFlowReport = async () => {
    if (transactions.length === 0) {
      alert("Tiada data transaksi untuk dianalisis. Sila masukkan rekod di bahagian 'Transaksi' terlebih dahulu.");
      return;
    }
    setLoadingCashFlow(true);
    const result = await geminiService.generateCashFlowStatement(transactions);
    setCashFlowReport(result || null);
    setLoadingCashFlow(false);
  };

  const downloadReport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative transition-colors duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
           </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">Penasihat Kewangan AI</h3>
          </div>
          <p className="text-slate-400 text-sm mb-6 max-w-2xl">
            Gunakan kecerdasan buatan untuk merumus prestasi kewangan persatuan. Pilih jenis laporan yang anda perlukan untuk mendapatkan analisis mendalam berdasarkan data transaksi sebenar.
          </p>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={generateReport}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              )}
              Analisis Strategik
            </button>

            <button 
              onClick={generateCashFlowReport}
              disabled={loadingCashFlow}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-lg shadow-cyan-500/20"
            >
              {loadingCashFlow ? (
                <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
              Penyata Aliran Tunai
            </button>

            <button 
              onClick={generateAnnualReport}
              disabled={loadingAnnual}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-lg shadow-indigo-500/20"
            >
              {loadingAnnual ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
              Laporan Tahunan
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            {report && (
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                    Analisis Strategik Tunai
                  </h4>
                  <button onClick={() => setReport(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {report}
                </div>
              </div>
            )}

            {cashFlowReport && (
              <div className="bg-cyan-900/20 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
                    Penyata Aliran Tunai Pro
                  </h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadReport(cashFlowReport, `Penyata_Aliran_Tunai_${new Date().toISOString().split('T')[0]}.txt`)}
                      className="text-cyan-400 hover:text-cyan-200 transition-colors p-1"
                      title="Muat Turun"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button onClick={() => setCashFlowReport(null)} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-xs font-mono leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                  {cashFlowReport}
                </div>
              </div>
            )}

            {annualReport && (
              <div className="bg-indigo-900/30 p-6 rounded-2xl border border-indigo-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-2xl lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-indigo-400 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
                    Laporan Ringkas Tahunan
                  </h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadReport(annualReport, `Laporan_Tahunan_Silat_${new Date().getFullYear()}.txt`)}
                      className="text-indigo-400 hover:text-indigo-200 transition-colors p-1"
                      title="Muat Turun"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button onClick={() => setAnnualReport(null)} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {annualReport}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
