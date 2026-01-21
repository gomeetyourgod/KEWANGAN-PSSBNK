
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Member, PaymentRecord, Transaction } from '../types';
import { MONTHS, MONTHLY_FEE } from '../constants';

interface DashboardProps {
  members: Member[];
  payments: PaymentRecord[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ members, payments, transactions }) => {
  const currentYear = new Date().getFullYear();

  const monthlyStats = MONTHS.map((name, index) => {
    const income = transactions
      .filter(t => t.type === 'IN' && new Date(t.date).getMonth() === index && new Date(t.date).getFullYear() === currentYear)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'OUT' && new Date(t.date).getMonth() === index && new Date(t.date).getFullYear() === currentYear)
      .reduce((acc, t) => acc + t.amount, 0);

    return { name, income, expense };
  });

  const totalIn = transactions.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Baki Tunai Semasa</p>
          <h3 className={`text-3xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            RM {balance.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-400 mt-2">Dana tersedia di tangan</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl shadow-sm border border-emerald-100">
          <p className="text-sm font-medium text-emerald-700 mb-1">Jumlah Pendapatan</p>
          <h3 className="text-3xl font-bold text-emerald-600">RM {totalIn.toLocaleString()}</h3>
          <p className="text-xs text-emerald-500 mt-2">Termasuk yuran & sumbangan</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100">
          <p className="text-sm font-medium text-rose-700 mb-1">Jumlah Perbelanjaan</p>
          <h3 className="text-3xl font-bold text-rose-600">RM {totalOut.toLocaleString()}</h3>
          <p className="text-xs text-rose-500 mt-2">Sewa, alatan & operasi</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-lg font-semibold text-slate-800 mb-6">Aliran Tunai {currentYear}</h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Masuk (RM)" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Keluar (RM)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
