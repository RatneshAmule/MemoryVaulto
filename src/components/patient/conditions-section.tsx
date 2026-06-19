'use client';

import { useState } from 'react';
import { Plus, Trash2, Heart } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const CLUSTERS = [
  { value: 'metabolic', label: 'Metabolic', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'cardiac', label: 'Cardiac', color: 'bg-red-500/20 text-red-400' },
  { value: 'respiratory', label: 'Respiratory', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'mental_health', label: 'Mental Health', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'neurological', label: 'Neurological', color: 'bg-indigo-500/20 text-indigo-400' },
  { value: 'autoimmune', label: 'Autoimmune', color: 'bg-rose-500/20 text-rose-400' },
  { value: 'infectious', label: 'Infectious', color: 'bg-green-500/20 text-green-400' },
  { value: 'oncology', label: 'Oncology', color: 'bg-pink-500/20 text-pink-400' },
];

export function ConditionsSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [diagnosedDate, setDiagnosedDate] = useState('');
  const [status, setStatus] = useState('active');
  const [icdCode, setIcdCode] = useState('');
  const [cluster, setCluster] = useState('');

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!name.trim()) { toast.error('Condition name is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/conditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          diagnosedDate,
          status,
          icdCode: icdCode || null,
          cluster: cluster || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, conditions: [...currentPatient.conditions, data.condition] });
        setName(''); setDiagnosedDate(''); setStatus('active'); setIcdCode(''); setCluster('');
        setShowForm(false);
        toast.success('Condition added');
      } else { toast.error('Failed to add condition'); }
    } catch { toast.error('Failed to add condition'); }
    setLoading(false);
  };

  const handleDelete = async (condId: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/conditions/${condId}`, { method: 'DELETE' });
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, conditions: currentPatient.conditions.filter((c) => c.id !== condId) });
        toast.success('Condition removed');
      }
    } catch { toast.error('Failed to remove condition'); }
  };

  const getClusterColor = (clusterVal: string) => {
    return CLUSTERS.find(c => c.value === clusterVal)?.color || 'bg-slate-500/20 text-slate-400';
  };

  const getClusterLabel = (clusterVal: string) => {
    return CLUSTERS.find(c => c.value === clusterVal)?.label || clusterVal;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Medical Conditions</h2>
          <p className="text-slate-400 text-sm mt-1">Active and resolved conditions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Condition
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 bg-slate-900 border-slate-800">
          <CardContent className="pt-4 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">Condition Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-800 border-slate-700 text-white mt-1.5" placeholder="e.g., Type 2 Diabetes" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Diagnosed Date</Label>
                <Input type="date" value={diagnosedDate} onChange={(e) => setDiagnosedDate(e.target.value)} className="bg-slate-800 border-slate-700 text-white mt-1.5" />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="chronic">Chronic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-sm">ICD Code</Label>
                <Input
                  value={icdCode}
                  onChange={(e) => setIcdCode(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1.5"
                  placeholder="e.g., E11.9"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Cluster</Label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1.5 text-white"
                  value={cluster}
                  onChange={e => setCluster(e.target.value)}
                >
                  <option value="">Select cluster...</option>
                  {CLUSTERS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                {loading ? 'Adding...' : 'Add Condition'}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentPatient.conditions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No conditions recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPatient.conditions.map((cond) => (
            <Card key={cond.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Heart className={`w-4 h-4 flex-shrink-0 ${cond.status === 'active' ? 'text-red-400' : 'text-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white">{cond.name}</span>
                        <Badge variant="outline" className={`text-xs ${
                          cond.status === 'active' ? 'bg-red-950/50 text-red-300 border-red-800/50' :
                          cond.status === 'chronic' ? 'bg-amber-950/50 text-amber-300 border-amber-800/50' :
                          'bg-slate-700/50 text-slate-300 border-slate-600/50'
                        }`}>
                          {cond.status}
                        </Badge>
                        {cond.cluster && (
                          <Badge className={`${getClusterColor(cond.cluster)} text-[10px] px-1.5 py-0`}>
                            {getClusterLabel(cond.cluster)}
                          </Badge>
                        )}
                        {cond.icdCode && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-slate-800 text-slate-400 border-slate-700">
                            {cond.icdCode}
                          </Badge>
                        )}
                      </div>
                      {cond.diagnosedDate && <p className="text-xs text-slate-400 mt-1">Diagnosed: {cond.diagnosedDate}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cond.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0 flex-shrink-0">
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
