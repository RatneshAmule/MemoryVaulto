'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, ToggleLeft, ToggleRight, Scale, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AdvanceDirectivesSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    directiveType: 'living-will',
    description: '',
    createdDate: '',
    witnessName: '',
    notarized: false,
    isActive: true,
  });
  const items = currentPatient?.advanceDirectives || [];

  const handleAdd = async () => {
    if (!currentPatient || !form.description || !form.createdDate) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/advance-directives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchPatient(currentPatient.id);
      setAdding(false);
      setForm({ directiveType: 'living-will', description: '', createdDate: '', witnessName: '', notarized: false, isActive: true });
      toast.success('Advance directive added');
    } else toast.error('Failed');
  };

  const toggleActive = async (directive: { id: string; isActive: boolean }) => {
    if (!currentPatient) return;
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/advance-directives/${directive.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !directive.isActive }),
      });
      if (res.ok) {
        await fetchPatient(currentPatient.id);
        toast.success(directive.isActive ? 'Directive deactivated' : 'Directive activated');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const typeColors: Record<string, string> = {
    'living-will': 'bg-blue-500/20 text-blue-400',
    'dnr': 'bg-red-500/20 text-red-400',
    'dni': 'bg-red-500/20 text-red-400',
    'comfort-care': 'bg-amber-500/20 text-amber-400',
    'organ-donation': 'bg-emerald-500/20 text-emerald-400',
    'power-of-attorney': 'bg-purple-500/20 text-purple-400',
  };

  const typeLabels: Record<string, string> = {
    'living-will': 'Living Will',
    'dnr': 'DNR',
    'dni': 'DNI',
    'comfort-care': 'Comfort Care',
    'organ-donation': 'Organ Donation',
    'power-of-attorney': 'Power of Attorney',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" /> Advance Directives
          </h2>
          <p className="text-sm text-slate-400">Your legal medical wishes</p>
        </div>
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="w-4 h-4 mr-1" />Add
        </Button>
      </div>

      {adding && (
        <Card className="mb-4 bg-slate-900 border-slate-800">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Directive Type</Label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1"
                  value={form.directiveType}
                  onChange={e => setForm({ ...form, directiveType: e.target.value })}
                >
                  <option value="living-will">Living Will</option>
                  <option value="dnr">DNR (Do Not Resuscitate)</option>
                  <option value="dni">DNI (Do Not Intubate)</option>
                  <option value="comfort-care">Comfort Care Only</option>
                  <option value="organ-donation">Organ Donation</option>
                  <option value="power-of-attorney">Power of Attorney</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Created Date</Label>
                <Input
                  className="bg-slate-800 border-slate-700 mt-1"
                  type="date"
                  value={form.createdDate}
                  onChange={e => setForm({ ...form, createdDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Description</Label>
              <Input
                className="bg-slate-800 border-slate-700 mt-1"
                placeholder="Describe this directive..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-xs">Witness Name</Label>
                <Input
                  className="bg-slate-800 border-slate-700 mt-1"
                  placeholder="Name of witness"
                  value={form.witnessName}
                  onChange={e => setForm({ ...form, witnessName: e.target.value })}
                />
              </div>
              <div className="flex flex-col">
                <Label className="text-slate-300 text-xs mb-1">Options</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.notarized}
                      onChange={e => setForm({ ...form, notarized: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-800"
                    />
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">Notarized</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    {form.isActive ? (
                      <><ToggleRight className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400">Active</span></>
                    ) : (
                      <><ToggleLeft className="w-5 h-5 text-slate-500" /><span className="text-slate-500">Inactive</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <p className="text-slate-500 text-sm">No advance directives recorded</p>
      ) : (
        <div className="space-y-2">
          {items.map((d, i) => (
            <Card key={i} className={`bg-slate-900 ${d.isActive ? 'border-slate-800' : 'border-slate-800 opacity-60'}`}>
              <CardContent className="pt-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={typeColors[d.directiveType] || 'bg-slate-500/20 text-slate-400'}>
                    {typeLabels[d.directiveType] || d.directiveType}
                  </Badge>
                  {d.notarized && (
                    <Badge className="bg-amber-500/20 text-amber-400">
                      <Scale className="w-3 h-3 mr-1" />Notarized
                    </Badge>
                  )}
                  {d.isActive && (
                    <Badge className="bg-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="w-3 h-3 mr-1" />Active
                    </Badge>
                  )}
                  {!d.isActive && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-700/50 text-slate-400 border-slate-600">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-300">{d.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-slate-500">
                    Created: {d.createdDate}
                    {d.witnessName ? ` • Witness: ${d.witnessName}` : ''}
                    {d.expiryDate ? ` • Expires: ${d.expiryDate}` : ''}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={d.isActive ? 'text-emerald-400 h-6' : 'text-slate-500 h-6'}
                    onClick={() => toggleActive(d)}
                  >
                    {d.isActive ? (
                      <><ToggleRight className="w-4 h-4 mr-1" /></>
                    ) : (
                      <><ToggleLeft className="w-4 h-4 mr-1" /></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
