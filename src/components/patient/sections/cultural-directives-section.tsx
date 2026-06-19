'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CulturalDirectivesSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ religion: '', directive: '', description: '', overrideAllowed: false });
  const items = currentPatient?.culturalDirectives || [];
  const handleAdd = async () => {
    if (!currentPatient || !form.religion) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/cultural-directives`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); } else toast.error('Failed');
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-amber-400" /> Cultural & Religious Directives</h2><p className="text-sm text-slate-400">Respecting beliefs IS part of medical care</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Religion</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Jehovah's Witness" value={form.religion} onChange={e => setForm({...form, religion: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Directive</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="no-blood-products" value={form.directive} onChange={e => setForm({...form, directive: e.target.value})} /></div>
        </div>
        <div><Label className="text-slate-300 text-xs">Description</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
      </CardContent></Card>}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No cultural directives recorded</p> : (
        <div className="space-y-2">{items.map((c, i) => (
          <Card key={i} className={`bg-slate-900 ${c.overrideAllowed ? 'border-amber-500/30' : 'border-red-500/30'}`}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1"><Badge className="bg-amber-500/20 text-amber-400">{c.religion}</Badge><Badge variant="outline">{c.directive}</Badge>{!c.overrideAllowed && <Badge variant="destructive">NO OVERRIDE</Badge>}</div>
              <p className="text-sm text-slate-300">{c.description}</p>
            </CardContent>
          </Card>
        ))}</div>
      )}
    </div>
  );
}
