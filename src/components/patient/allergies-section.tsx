'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const severityColors: Record<string, string> = {
  'life-threatening': 'bg-red-950/80 text-red-200 border-red-700/80',
  severe: 'bg-red-950/50 text-red-300 border-red-800/50',
  moderate: 'bg-amber-950/50 text-amber-300 border-amber-800/50',
  mild: 'bg-yellow-950/50 text-yellow-300 border-yellow-800/50',
};

const severityDots: Record<string, string> = {
  'life-threatening': 'bg-red-600',
  severe: 'bg-red-500',
  moderate: 'bg-amber-500',
  mild: 'bg-yellow-500',
};

export function AllergiesSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [reaction, setReaction] = useState('');
  const [crossReactivity, setCrossReactivity] = useState('');
  const [treatmentRequired, setTreatmentRequired] = useState('');
  const [lastReactionDate, setLastReactionDate] = useState('');

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!name.trim()) { toast.error('Allergy name is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/allergies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          severity,
          reaction,
          crossReactivity,
          treatmentRequired,
          lastReactionDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({
          ...currentPatient,
          allergies: [...currentPatient.allergies, data.allergy],
        });
        setName(''); setSeverity('moderate'); setReaction('');
        setCrossReactivity(''); setTreatmentRequired(''); setLastReactionDate('');
        setShowForm(false);
        toast.success('Allergy added');
      } else {
        toast.error('Failed to add allergy');
      }
    } catch { toast.error('Failed to add allergy'); }
    setLoading(false);
  };

  const handleDelete = async (allergyId: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/allergies/${allergyId}`, { method: 'DELETE' });
      if (res.ok) {
        setCurrentPatient({
          ...currentPatient,
          allergies: currentPatient.allergies.filter((a) => a.id !== allergyId),
        });
        toast.success('Allergy removed');
      }
    } catch { toast.error('Failed to remove allergy'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Allergies</h2>
          <p className="text-slate-400 text-sm mt-1">Critical allergy information for emergency responders</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Allergy
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Allergy Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Penicillin" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="life-threatening">Life-threatening</SelectItem>
                  <SelectItem value="severe">Severe (Anaphylaxis)</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Reaction</Label>
              <Input value={reaction} onChange={(e) => setReaction(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Hives, swelling" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Cross-Reactivity</Label>
              <Input value={crossReactivity} onChange={(e) => setCrossReactivity(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Cephalosporins, Amoxicillin" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Treatment Required</Label>
              <Input value={treatmentRequired} onChange={(e) => setTreatmentRequired(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Epinephrine auto-injector" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Last Reaction Date</Label>
              <Input type="date" value={lastReactionDate} onChange={(e) => setLastReactionDate(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Adding...' : 'Add Allergy'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {currentPatient.allergies.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No allergies recorded</p>
          <p className="text-sm mt-1">Add your first allergy to keep emergency responders informed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPatient.allergies.map((allergy) => (
            <div key={allergy.id} className={`p-4 rounded-xl border ${severityColors[allergy.severity] || severityColors.moderate}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${severityDots[allergy.severity] || severityDots.moderate}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{allergy.name}</span>
                      <Badge variant="outline" className={`text-xs ${severityColors[allergy.severity]}`}>
                        {allergy.severity}
                      </Badge>
                    </div>
                    {allergy.reaction && <p className="text-xs text-slate-400 mt-1">Reaction: {allergy.reaction}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(allergy.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {/* Extended fields */}
              {(allergy.crossReactivity || allergy.treatmentRequired || allergy.lastReactionDate) && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {allergy.crossReactivity && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cross-Reactivity</p>
                      <p className="text-xs text-slate-300">{allergy.crossReactivity}</p>
                    </div>
                  )}
                  {allergy.treatmentRequired && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Treatment Required</p>
                      <p className="text-xs text-slate-300">{allergy.treatmentRequired}</p>
                    </div>
                  )}
                  {allergy.lastReactionDate && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Last Reaction</p>
                      <p className="text-xs text-slate-300">{allergy.lastReactionDate}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
