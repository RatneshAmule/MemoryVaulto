'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HardHat, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function OccupationalExposuresSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ workplace: '', hazardType: '', specificAgent: '', exposureLevel: 'moderate', lastExposure: '', ppeRequired: '' });
  const items = currentPatient?.occupationalExposures || [];
  const handleAdd = async () => {
    if (!currentPatient || !form.workplace) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/occupational-exposures`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); } else toast.error('Failed');
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><HardHat className="w-5 h-5 text-amber-400" /> Occupational Exposures</h2><p className="text-sm text-slate-400">Workplace hazards that affect emergency treatment</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Workplace</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.workplace} onChange={e => setForm({...form, workplace: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Hazard Type</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="chemical, radiation..." value={form.hazardType} onChange={e => setForm({...form, hazardType: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Specific Agent</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Organophosphates" value={form.specificAgent} onChange={e => setForm({...form, specificAgent: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Exposure Level</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.exposureLevel} onChange={e => setForm({...form, exposureLevel: e.target.value})} /></div>
        </div>
        <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
      </CardContent></Card>}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No occupational exposures recorded</p> : (
        <div className="space-y-2">{items.map((o, i) => (
          <Card key={i} className="bg-slate-900 border-amber-500/20"><CardContent className="pt-3">
            <div className="flex items-center gap-2 mb-1"><Badge className="bg-amber-500/20 text-amber-400">{o.hazardType}</Badge><span className="font-medium text-sm">{o.workplace}</span></div>
            {o.specificAgent && <div className="text-sm text-slate-300">Agent: {o.specificAgent}</div>}
            <div className="text-xs text-slate-500">Level: {o.exposureLevel} {o.lastExposure ? `• Last: ${o.lastExposure}` : ''}</div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
