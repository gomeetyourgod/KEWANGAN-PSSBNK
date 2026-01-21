
import React, { useState, useMemo } from 'react';
import { Member } from '../types';

interface MemberListProps {
  members: Member[];
  onAdd: (member: Omit<Member, 'id'>) => void;
  onUpdate: (member: Member) => void;
  onDelete: (id: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({ members, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icNumber: '',
    memberNumber: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Salinan data yang disusun supaya tidak mengganggu state asal
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const numA = parseInt(a.memberNumber) || 0;
      const numB = parseInt(b.memberNumber) || 0;
      return numA - numB;
    });
  }, [members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId });
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icNumber: '',
      memberNumber: '',
      phone: '',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (member: Member) => {
    setFormData({
      name: member.name,
      icNumber: member.icNumber,
      memberNumber: member.memberNumber,
      phone: member.phone,
      joinDate: member.joinDate
    });
    setEditingId(member.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string, name: string) => {
    const confirmMessage = `Adakah anda pasti mahu memadam ahli: ${name}?\n\nSemua rekod yuran dan transaksi berkaitan juga akan dipadamkan secara kekal.`;
    if (window.confirm(confirmMessage)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800">Senarai Ahli</h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200 shadow-sm">
            {members.length} Orang Ahli
          </span>
        </div>
        <button 
          type="button"
          onClick={() => {
            if (isFormOpen) resetForm();
            else setIsFormOpen(true);
          }}
          className={`${isFormOpen ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-md'} px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-medium`}
        >
          {isFormOpen ? 'Batal' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Ahli
            </>
          )}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${editingId ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              {editingId ? 'Edit Maklumat Ahli' : 'Daftar Ahli Baru'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Penuh</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">No. IC</label>
              <input 
                type="text" 
                required
                placeholder="900101-14-5001"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.icNumber}
                onChange={e => setFormData({...formData, icNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">No. Ahli</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={formData.memberNumber}
                onChange={e => setFormData({...formData, memberNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">No. Telefon</label>
              <input 
                type="tel" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="012-3456789"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className={`flex-1 ${editingId ? 'bg-amber-600' : 'bg-slate-800'} text-white py-2 rounded-lg hover:opacity-90 transition-colors font-bold text-sm shadow-sm`}>
                {editingId ? 'Kemaskini' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">No. Ahli</th>
                <th className="px-6 py-4 font-semibold">Nama Ahli</th>
                <th className="px-6 py-4 font-semibold">No. IC</th>
                <th className="px-6 py-4 font-semibold">No. Tel</th>
                <th className="px-6 py-4 font-semibold">Tarikh Masuk</th>
                <th className="px-6 py-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">Tiada rekod ahli dijumpai.</td>
                </tr>
              ) : (
                sortedMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-indigo-600 font-bold">#{member.memberNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-mono">{member.icNumber || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{member.phone}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{new Date(member.joinDate).toLocaleDateString('ms-MY')}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => handleEdit(member)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold text-[11px] uppercase tracking-tight transition-all"
                        >
                          Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteClick(member.id, member.name)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold text-[11px] uppercase tracking-tight transition-all"
                        >
                          Padam
                        </button>
                      </div>
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

export default MemberList;
