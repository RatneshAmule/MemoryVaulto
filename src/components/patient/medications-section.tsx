'use client';

import { useState } from 'react';
import { Plus, Trash2, Pill, AlertTriangle, Brain, Eye } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const MED_CATEGORIES = [
  { value: 'cardiac', label: 'Cardiac' },
  { value: 'psychiatric', label: 'Psychiatric' },
  { value: 'pain', label: 'Pain Management' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'neurological', label: 'Neurological' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'gastrointestinal', label: 'Gastrointestinal' },
  { value: 'infection', label: 'Infection/Antibiotic' },
  { value: 'immunosuppressant', label: 'Immunosuppressant' },
  { value: 'hormonal', label: 'Hormonal/Thyroid' },
  { value: 'anticoagulant', label: 'Anticoagulant' },
  { value: 'other', label: 'Other' },
];

const categoryColors: Record<string, string> = {
  cardiac: 'bg-red-500/20 text-red-400',
  psychiatric: 'bg-purple-500/20 text-purple-400',
  pain: 'bg-amber-500/20 text-amber-400',
  diabetes: 'bg-blue-500/20 text-blue-400',
  neurological: 'bg-indigo-500/20 text-indigo-400',
  respiratory: 'bg-cyan-500/20 text-cyan-400',
  gastrointestinal: 'bg-green-500/20 text-green-400',
  infection: 'bg-rose-500/20 text-rose-400',
  immunosuppressant: 'bg-orange-500/20 text-orange-400',
  hormonal: 'bg-pink-500/20 text-pink-400',
  anticoagulant: 'bg-red-600/20 text-red-300',
  other: 'bg-slate-500/20 text-slate-400',
};

export function MedicationsSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [prescriber, setPrescriber] = useState('');
  const [category, setCategory] = useState('');
  const [isOpioid, setIsOpioid] = useState(false);
  const [isPsychMed, setIsPsychMed] = useState(false);
  const [requiresMonitoring, setRequiresMonitoring] = useState(false);

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!name.trim() || !dose.trim() || !frequency.trim()) {
      toast.error('Name, dose, and frequency are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, dose, frequency, startDate, prescriber,
          category: category || null,
          isOpioid,
          isPsychMed,
          requiresMonitoring,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, medications: [...currentPatient.medications, data.medication] });
        setName(''); setDose(''); setFrequency(''); setStartDate(''); setPrescriber('');
        setCategory(''); setIsOpioid(false); setIsPsychMed(false); setRequiresMonitoring(false);
        setShowForm(false);
        toast.success('Medication added');
      } else { toast.error('Failed to add medication'); }
    } catch { toast.error('Failed to add medication'); }
    setLoading(false);
  };

  const handleDelete = async (medId: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/medications/${medId}`, { method: 'DELETE' });
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, medications: currentPatient.medications.filter((m) => m.id !== medId) });
        toast.success('Medication removed');
      }
    } catch { toast.error('Failed to remove medication'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Medications</h2>
          <p className="text-slate-400 text-sm mt-1">Current and recent medications</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Medication
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 bg-slate-900 border-slate-800">
          <CardContent className="pt-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">Medication Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-800 border-slate-700 text-white mt-1.5" placeholder="e.g., Metformin" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Dose</Label>
                <Input value={dose} onChange={(e) => setDose(e.target.value)} className="bg-slate-800 border-slate-700 text-white mt-1.5" placeholder="e.g., 500mg" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Frequency</Label>
                <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} className="bg-slate-800 border-slate-700 text-white mt-1.5" placeholder="e.g., Twice daily" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Category</Label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1.5 text-white"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Select category...</option>
                  {MED_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-800 border-slate-700 text-white mt-1.5" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Prescriber</Label>
                <Input value={prescriber} onChange={(e) => setPrescriber(e.target.value)} className="bg-slate-800 border-slate-700 text-white mt-1.5" placeholder="e.g., Dr. Patel" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpioid}
                  onChange={e => setIsOpioid(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800"
                />
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">Opioid</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPsychMed}
                  onChange={e => setIsPsychMed(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800"
                />
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Psychiatric Med</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresMonitoring}
                  onChange={e => setRequiresMonitoring(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800"
                />
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">Requires Monitoring</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                {loading ? 'Adding...' : 'Add Medication'}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentPatient.medications.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No medications recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPatient.medications.map((med) => (
            <Card key={med.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Pill className="w-4 h-4 text-amber-400" />
                      <span className="font-medium text-amber-200">{med.name}</span>
                      {med.isOpioid && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0">
                          <AlertTriangle className="w-3 h-3 mr-0.5" />OPIOID
                        </Badge>
                      )}
                      {med.isPsychMed && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0">
                          <Brain className="w-3 h-3 mr-0.5" />PSYCH
                        </Badge>
                      )}
                      {med.requiresMonitoring && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px] px-1.5 py-0">
                          <Eye className="w-3 h-3 mr-0.5" />MONITOR
                        </Badge>
                      )}
                      {med.category && (
                        <Badge className={`${categoryColors[med.category] || 'bg-slate-500/20 text-slate-400'} text-[10px] px-1.5 py-0`}>
                          {MED_CATEGORIES.find(c => c.value === med.category)?.label || med.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{med.dose} • {med.frequency}</p>
                    <div className="flex gap-3 mt-1 text-xs text-slate-400">
                      {med.startDate && <span>Since {med.startDate}</span>}
                      {med.prescriber && <span>Prescribed by {med.prescriber}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(med.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
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
