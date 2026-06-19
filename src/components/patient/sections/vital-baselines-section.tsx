'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function VitalBaselinesSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ vitalType: '', value: '', unit: '', source: 'routine-visit', recordedDate: '' });
  const items = currentPatient?.vitalBaselines || [];

  const handleAdd = async () => {
    if (!currentPatient || !form.vitalType) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/vital-baselines`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: parseFloat(form.value) || 0 })
    });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); }
    else toast.error('Failed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-green-400" /> Vital Baselines</h2><p className="text-sm text-slate-400">Your normal values — compare to YOU, not averages</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && (
        <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-slate-300 text-xs">Vital Type</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="bp_systolic" value={form.vitalType} onChange={e => setForm({...form, vitalType: e.target.value})} /></div>
            <div><Label className="text-slate-300 text-xs">Value</Label><Input className="bg-slate-800 border-slate-700 mt-1" type="number" placeholder="120" value={form.value} onChange={e => setForm({...form, value: e.target.value})} /></div>
            <div><Label className="text-slate-300 text-xs">Unit</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="mmHg" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300 text-xs">Source</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.source} onChange={e => setForm({...form, source: e.target.value})} /></div>
            <div><Label className="text-slate-300 text-xs">Date</Label><Input className="bg-slate-800 border-slate-700 mt-1" type="date" value={form.recordedDate} onChange={e => setForm({...form, recordedDate: e.target.value})} /></div>
          </div>
          <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No baselines recorded</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map((v, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800"><CardContent className="pt-4 text-center">
              <div className="text-xs text-slate-500 mb-1">{v.vitalType.replace(/_/g, ' ')}</div>
              <div className="text-2xl font-bold text-green-400">{v.value}</div>
              <div className="text-xs text-slate-400">{v.unit}</div>
              <div className="text-[10px] text-slate-500 mt-1">{v.source} • {v.recordedDate}</div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
