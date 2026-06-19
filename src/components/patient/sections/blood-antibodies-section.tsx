'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function BloodAntibodiesSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ antibody: '', antibodyType: 'IgG', detectedDate: '', significance: 'clinically-significant' });
  const items = currentPatient?.bloodAntibodies || [];
  const handleAdd = async () => {
    if (!currentPatient || !form.antibody) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/blood-antibodies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); } else toast.error('Failed');
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Droplets className="w-5 h-5 text-red-400" /> Blood Antibodies</h2><p className="text-sm text-slate-400">Beyond ABO — rare antibodies and compatibility</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Antibody</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Anti-Kell" value={form.antibody} onChange={e => setForm({...form, antibody: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Type</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.antibodyType} onChange={e => setForm({...form, antibodyType: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Detected Date</Label><Input className="bg-slate-800 border-slate-700 mt-1" type="date" value={form.detectedDate} onChange={e => setForm({...form, detectedDate: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Significance</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.significance} onChange={e => setForm({...form, significance: e.target.value})} /></div>
        </div>
        <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
      </CardContent></Card>}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No antibodies recorded</p> : (
        <div className="space-y-2">{items.map((b, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800"><CardContent className="pt-3 flex items-center justify-between">
            <div><span className="font-medium text-red-400">{b.antibody}</span> <Badge variant="outline" className="text-xs ml-2">{b.antibodyType}</Badge></div>
            <div className="text-xs text-slate-400">{b.significance} • {b.detectedDate}</div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
