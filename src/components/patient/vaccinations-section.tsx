'use client';

import { useState } from 'react';
import { Plus, Trash2, Syringe } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50',
  partial: 'bg-amber-950/50 text-amber-300 border-amber-800/50',
  due: 'bg-red-950/50 text-red-300 border-red-800/50',
};

export function VaccinationsSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('completed');

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!name.trim() || !date) { toast.error('Name and date are required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/vaccinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, vaccinations: [...currentPatient.vaccinations, data.vaccination] });
        setName(''); setDate(''); setStatus('completed'); setShowForm(false);
        toast.success('Vaccination added');
      } else { toast.error('Failed to add vaccination'); }
    } catch { toast.error('Failed to add vaccination'); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/vaccinations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, vaccinations: currentPatient.vaccinations.filter((v) => v.id !== id) });
        toast.success('Vaccination removed');
      }
    } catch { toast.error('Failed to remove vaccination'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Vaccinations</h2>
          <p className="text-slate-400 text-sm mt-1">Immunization records</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Vaccination
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Vaccine Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., COVID-19 (Pfizer)" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Adding...' : 'Add Vaccination'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {currentPatient.vaccinations.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Syringe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No vaccinations recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPatient.vaccinations.map((vax) => (
            <div key={vax.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <Syringe className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{vax.name}</span>
                    <Badge variant="outline" className={`text-xs ${statusColors[vax.status] || statusColors.completed}`}>
                      {vax.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{vax.date}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(vax.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
