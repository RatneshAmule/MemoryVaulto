'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Radiation, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export function RadiationExposureSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ source: '', bodyRegion: '', doseMSv: '', studyDate: '', facility: '' });
  const items = currentPatient?.radiationExposures || [];
  const totalDose = items.reduce((sum, r) => sum + r.doseMSv, 0);
  const handleAdd = async () => {
    if (!currentPatient || !form.source) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/radiation-exposures`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, doseMSv: parseFloat(form.doseMSv) || 0, cumulativeTotal: totalDose + (parseFloat(form.doseMSv) || 0) }) });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); } else toast.error('Failed');
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Radiation className="w-5 h-5 text-yellow-400" /> Radiation Exposure</h2><p className="text-sm text-slate-400">Cumulative radiation tracking</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4">
        <div className="text-center mb-2"><div className="text-3xl font-bold text-yellow-400">{totalDose.toFixed(1)} mSv</div><div className="text-xs text-slate-500">Cumulative Lifetime Dose</div></div>
        <Progress value={Math.min(100, (totalDose / 100) * 100)} className="h-3" />
        <div className="flex justify-between text-xs text-slate-500 mt-1"><span>0 mSv</span><span className={totalDose > 50 ? 'text-yellow-400' : 'text-slate-500'}>50 mSv (caution)</span><span className={totalDose > 100 ? 'text-red-400' : 'text-slate-500'}>100 mSv (threshold)</span></div>
      </CardContent></Card>
      {adding && <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-slate-300 text-xs">Source</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="ct-scan" value={form.source} onChange={e => setForm({...form, source: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Body Region</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.bodyRegion} onChange={e => setForm({...form, bodyRegion: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Dose (mSv)</Label><Input className="bg-slate-800 border-slate-700 mt-1" type="number" step="0.1" value={form.doseMSv} onChange={e => setForm({...form, doseMSv: e.target.value})} /></div>
        </div>
        <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
      </CardContent></Card>}
      <div className="space-y-2">{items.map((r, i) => (
        <Card key={i} className="bg-slate-900 border-slate-800"><CardContent className="pt-3 flex justify-between items-center">
          <div><span className="font-medium text-sm">{r.source}</span> <span className="text-slate-500">• {r.bodyRegion}</span></div>
          <div className="text-right"><Badge variant="outline">{r.doseMSv} mSv</Badge><div className="text-xs text-slate-500">{r.studyDate}</div></div>
        </CardContent></Card>
      ))}</div>
    </div>
  );
}
