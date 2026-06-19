'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dna, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function PharmacogenomicsSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ gene: '', variant: '', implications: '', medications: '' });

  const items = currentPatient?.pharmacogenomics || [];

  const handleAdd = async () => {
    if (!currentPatient || !form.gene) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/pharmacogenomics`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); setForm({ gene: '', variant: '', implications: '', medications: '' }); toast.success('Added'); }
    else toast.error('Failed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Dna className="w-5 h-5 text-purple-400" /> Pharmacogenomics</h2><p className="text-sm text-slate-400">How your genes metabolize drugs</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && (
        <Card className="mb-4 bg-slate-900 border-slate-800">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300 text-xs">Gene</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="CYP2D6" value={form.gene} onChange={e => setForm({...form, gene: e.target.value})} /></div>
              <div><Label className="text-slate-300 text-xs">Variant</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="poor-metabolizer" value={form.variant} onChange={e => setForm({...form, variant: e.target.value})} /></div>
            </div>
            <div><Label className="text-slate-300 text-xs">Implications</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Cannot metabolize codeine effectively" value={form.implications} onChange={e => setForm({...form, implications: e.target.value})} /></div>
            <div><Label className="text-slate-300 text-xs">Affected Medications (comma-separated)</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Codeine,Tramadol" value={form.medications} onChange={e => setForm({...form, medications: e.target.value})} /></div>
            <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No pharmacogenomic data recorded</p> : (
        <div className="space-y-3">
          {items.map((pg, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-purple-500/20 text-purple-400">{pg.gene}</Badge>
                      <Badge variant="outline" className="text-slate-300">{pg.variant}</Badge>
                    </div>
                    <p className="text-sm text-slate-300">{pg.implications}</p>
                    {pg.medications && <p className="text-xs text-slate-500 mt-1">Affected: {pg.medications}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
