'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Edit, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function PainProfileSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [editing, setEditing] = useState(false);
  const pp = currentPatient?.painProfile;
  const [form, setForm] = useState(pp || { chronicPainConditions: '', currentPainPlan: '', opioidTolerance: 'naive', opioidUseDisorderHistory: 'none', effectiveMedications: '', ineffectiveMedications: '', painMedAllergies: '', sickleCellStatus: false, naloxonePrescribed: false, painManagementDoctor: '' });

  const handleSave = async () => {
    if (!currentPatient) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/pain-profile`, {
      method: pp ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    if (res.ok) { await fetchPatient(currentPatient.id); setEditing(false); toast.success('Saved'); } else toast.error('Failed');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-pink-400" /> Pain Profile</h2><p className="text-sm text-slate-400">Prevents both under-treatment and overdose</p></div>
        <Button size="sm" onClick={() => { setEditing(!editing); if (pp) setForm({ chronicPainConditions: pp.chronicPainConditions, currentPainPlan: pp.currentPainPlan, opioidTolerance: pp.opioidTolerance, opioidUseDisorderHistory: pp.opioidUseDisorderHistory, effectiveMedications: pp.effectiveMedications, ineffectiveMedications: pp.ineffectiveMedications, painMedAllergies: pp.painMedAllergies, sickleCellStatus: pp.sickleCellStatus, naloxonePrescribed: pp.naloxonePrescribed, painManagementDoctor: pp.painManagementDoctor || '' }); }}>
          {editing ? <><Save className="w-4 h-4 mr-1" />Save</> : <><Edit className="w-4 h-4 mr-1" />Edit</>}
        </Button>
      </div>
      {editing ? (
        <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
          <div><Label className="text-slate-300 text-xs">Chronic Pain Conditions</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.chronicPainConditions} onChange={e => setForm({...form, chronicPainConditions: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Current Pain Plan</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.currentPainPlan} onChange={e => setForm({...form, currentPainPlan: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300 text-xs">Opioid Tolerance</Label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1" value={form.opioidTolerance} onChange={e => setForm({...form, opioidTolerance: e.target.value})}>
                <option value="naive">Naive</option><option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option>
              </select>
            </div>
            <div><Label className="text-slate-300 text-xs">OUD History</Label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1" value={form.opioidUseDisorderHistory} onChange={e => setForm({...form, opioidUseDisorderHistory: e.target.value})}>
                <option value="none">None</option><option value="active">Active</option><option value="in-recovery">In Recovery</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300 text-xs">Effective Meds</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.effectiveMedications} onChange={e => setForm({...form, effectiveMedications: e.target.value})} /></div>
            <div><Label className="text-slate-300 text-xs">Ineffective Meds</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.ineffectiveMedications} onChange={e => setForm({...form, ineffectiveMedications: e.target.value})} /></div>
          </div>
          <Button size="sm" onClick={handleSave}>Save Profile</Button>
        </CardContent></Card>
      ) : pp ? (
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4"><div className="text-xs text-slate-500 mb-1">Opioid Tolerance</div><Badge className={pp.opioidTolerance === 'naive' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>{pp.opioidTolerance}</Badge></CardContent></Card>
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4"><div className="text-xs text-slate-500 mb-1">OUD History</div><Badge className={pp.opioidUseDisorderHistory === 'none' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{pp.opioidUseDisorderHistory}</Badge></CardContent></Card>
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4"><div className="text-xs text-slate-500 mb-1">Effective Meds</div><div className="text-sm text-slate-300">{pp.effectiveMedications || 'None listed'}</div></CardContent></Card>
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4"><div className="text-xs text-slate-500 mb-1">Pain Conditions</div><div className="text-sm text-slate-300">{pp.chronicPainConditions || 'None'}</div></CardContent></Card>
          {pp.sickleCellStatus && <Card className="bg-slate-900 border-red-500/30"><CardContent className="pt-4"><Badge variant="destructive">Sickle Cell Status</Badge></CardContent></Card>}
          {pp.painManagementDoctor && <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4"><div className="text-xs text-slate-500 mb-1">Pain Management MD</div><div className="text-sm text-slate-300">{pp.painManagementDoctor}</div></CardContent></Card>}
        </div>
      ) : <p className="text-slate-500 text-sm">No pain profile configured. Click Edit to create one.</p>}
    </div>
  );
}
