
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
  const [globalSummary, setGlobalSummary] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [loadingCashFlow, setLoadingCashFlow] = useState(false);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  const generateGlobalSummary = async () => {
    setLoadingGlobal(true);
    const result = await geminiService.generateGlobalExecutiveSummary(members, payments, transactions);
    setGlobalSummary(result || null);
    setLoadingGlobal(false);
  };

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

  const exportToExcel = () => {
    const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
    const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIn - totalOut;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Section 1: Ringkasan
    csvContent += "RINGKASAN KEWANGAN KESELURUHAN\n";
    csvContent += `Jumlah Pendapatan (RM),${totalIn.toFixed(2)}\n`;
    csvContent += `Jumlah Perbelanjaan (RM),${totalOut.toFixed(2)}\n`;
    csvContent += `Baki Semasa (RM),${balance.toFixed(2)}\n\n`;

    // Section 2: Ahli
    csvContent += "SENARAI AHLI PERSATUAN\n";
    csvContent += "No. Ahli,Nama,No. IC,Telefon,Tarikh Join\n";
    members.forEach(m => {
      csvContent += `${m.memberNumber},${m.name},${m.icNumber},${m.phone},${m.joinDate}\n`;
    });
    csvContent += "\n";

    // Section 3: Transaksi
    csvContent += "REKOD TRANSAKSI PENUH\n";
    csvContent += "Tarikh,Jenis,Kategori,Jumlah (RM),Nota\n";
    transactions.forEach(t => {
      csvContent += `${t.date},${t.type},${t.category},${t.amount.toFixed(2)},"${t.description.replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penuh_Silat_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printAsPDF = () => {
    window.print();
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
      {/* Print View Only Header */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-slate-900 pb-4">
        <h1 className="text-2xl font-black uppercase">Laporan Rasmi Pengurusan Persatuan Silat</h1>
        <p className="text-sm font-bold text-slate-600">Tarikh Laporan: {new Date().toLocaleDateString('ms-MY')}</p>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl overflow-hidden relative transition-colors duration-300 no-print">
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

          <div className="flex flex-wrap gap-3 mb-6">
            <button 
              onClick={generateGlobalSummary}
              disabled={loadingGlobal}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 text-sm shadow-lg shadow-amber-500/20"
            >
              {loadingGlobal ? (
                <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v4a2 2 0 002 2h4" /></svg>
              )}
              Laporan Eksekutif (AI)
            </button>

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
          </div>

          <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-800">
            <button 
              onClick={exportToExcel}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Muat Turun Excel (CSV)
            </button>
            <button 
              onClick={printAsPDF}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Cetak Laporan (PDF)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
             {globalSummary && (
              <div className="bg-amber-900/20 p-8 rounded-2xl border border-amber-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-2xl lg:col-span-2 print:bg-white print:border-slate-200 print:text-black print:shadow-none print:p-0 print:m-0">
                <div className="flex justify-between items-center mb-6 no-print">
                  <h4 className="font-bold text-amber-400 flex items-center gap-2 uppercase tracking-widest text-sm">
                    <span className="flex h-3 w-3 rounded-full bg-amber-400"></span>
                    Laporan Eksekutif Keseluruhan
                  </h4>
                  <button onClick={() => setGlobalSummary(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-slate-200 text-base leading-relaxed whitespace-pre-wrap print:text-black print:prose-slate">
                  {globalSummary}
                </div>
              </div>
            )}

            {report && (
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-2xl print:bg-white print:border-slate-200 print:text-black">
                <div className="flex justify-between items-center mb-4 no-print">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                    Analisis Strategik Tunai
                  </h4>
                  <button onClick={() => setReport(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap print:text-black">
                  {report}
                </div>
              </div>
            )}

            {cashFlowReport && (
              <div className="bg-cyan-900/20 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-2xl print:bg-white print:border-slate-200 print:text-black">
                <div className="flex justify-between items-center mb-4 no-print">
                  <h4 className="font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
                    Penyata Aliran Tunai Pro
                  </h4>
                  <div className="flex gap-2">
                    <button onClick={() => setCashFlowReport(null)} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none text-slate-300 text-xs font-mono leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5 whitespace-pre-wrap print:bg-white print:text-black">
                  {cashFlowReport}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer for PDF Print */}
      <div className="hidden print:block mt-12 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
        <p>Laporan ini dijana secara automatik oleh Sistem Pengurusan Yuran Silat.</p>
        <p>&copy; {new Date().getFullYear()} Persatuan Silat Melayu. Semua maklumat adalah sulit.</p>
      </div>
    </div>
  );
};

export default AIAssistant;
