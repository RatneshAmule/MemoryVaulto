'use client';

import { useState } from 'react';
import { Plus, Trash2, Scissors } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function SurgeriesSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [hospital, setHospital] = useState('');
  const [notes, setNotes] = useState('');

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!name.trim() || !date) { toast.error('Name and date are required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/surgeries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, hospital, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, surgeries: [...currentPatient.surgeries, data.surgery] });
        setName(''); setDate(''); setHospital(''); setNotes(''); setShowForm(false);
        toast.success('Surgery added');
      } else { toast.error('Failed to add surgery'); }
    } catch { toast.error('Failed to add surgery'); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/surgeries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, surgeries: currentPatient.surgeries.filter((s) => s.id !== id) });
        toast.success('Surgery removed');
      }
    } catch { toast.error('Failed to remove surgery'); }
  };

  const sorted = [...currentPatient.surgeries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Surgeries</h2>
          <p className="text-slate-400 text-sm mt-1">Surgical history timeline</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Surgery
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Procedure Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Appendectomy" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Hospital</Label>
              <Input value={hospital} onChange={(e) => setHospital(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="Hospital name" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="Additional notes" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Adding...' : 'Add Surgery'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Scissors className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No surgeries recorded</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700" />
          <div className="space-y-4">
            {sorted.map((surgery) => (
              <div key={surgery.id} className="relative pl-12">
                <div className="absolute left-3 top-4 w-5 h-5 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                  <Scissors className="w-2.5 h-2.5 text-slate-400" />
                </div>
                <div className="flex items-start justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div>
                    <span className="font-medium">{surgery.name}</span>
                    <p className="text-sm text-slate-400 mt-1">{surgery.date} {surgery.hospital ? `• ${surgery.hospital}` : ''}</p>
                    {surgery.notes && <p className="text-xs text-slate-500 mt-1">{surgery.notes}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(surgery.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
