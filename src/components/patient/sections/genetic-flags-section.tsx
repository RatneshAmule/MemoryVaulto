'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dna, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function GeneticFlagsSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ condition: '', gene: '', implications: '', medicationsToAvoid: '', safeAlternatives: '', familyScreening: false });
  const items = currentPatient?.geneticFlags || [];
  const handleAdd = async () => {
    if (!currentPatient || !form.condition) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/genetic-flags`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); } else toast.error('Failed');
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Dna className="w-5 h-5 text-rose-400" /> Genetic Flags</h2><p className="text-sm text-slate-400">Genetic conditions that make standard treatment deadly</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Condition</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Malignant hyperthermia" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Gene</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="RYR1" value={form.gene} onChange={e => setForm({...form, gene: e.target.value})} /></div>
        </div>
        <div><Label className="text-slate-300 text-xs">Implications</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.implications} onChange={e => setForm({...form, implications: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Medications to Avoid</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Succinylcholine" value={form.medicationsToAvoid} onChange={e => setForm({...form, medicationsToAvoid: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Safe Alternatives</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Rocuronium" value={form.safeAlternatives} onChange={e => setForm({...form, safeAlternatives: e.target.value})} /></div>
        </div>
        <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
      </CardContent></Card>}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No genetic flags</p> : (
        <div className="space-y-3">{items.map((g, i) => (
          <Card key={i} className="bg-slate-900 border-rose-500/30"><CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2"><Badge variant="destructive">{g.condition}</Badge>{g.gene && <Badge variant="outline">{g.gene}</Badge>}{g.familyScreening && <Badge className="bg-yellow-500/20 text-yellow-400">Family Screening</Badge>}</div>
            <p className="text-sm text-slate-300 mb-2">{g.implications}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-red-400">AVOID:</span> <span className="text-slate-400">{g.medicationsToAvoid || 'None listed'}</span></div>
              <div><span className="text-green-400">SAFE:</span> <span className="text-slate-400">{g.safeAlternatives || 'None listed'}</span></div>
            </div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
