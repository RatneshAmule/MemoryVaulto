'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Plus, Heart, Scissors, AlertTriangle, Brain, Syringe, Battery } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const iconMap: Record<string, any> = { Heart, Scissors, AlertTriangle, Brain, Syringe, Battery };

export function MedicalTimelineSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ eventType: 'diagnosis', title: '', description: '', eventDate: '', severity: 'routine' });
  const items = currentPatient?.medicalTimeline || [];
  const handleAdd = async () => {
    if (!currentPatient || !form.title) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/timeline-events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); } else toast.error('Failed');
  };
  const severityColors: Record<string, string> = { critical: 'border-red-500/50', significant: 'border-amber-500/30', routine: 'border-slate-800' };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Medical Timeline</h2><p className="text-sm text-slate-400">Your complete medical journey</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-slate-300 text-xs">Event Type</Label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1" value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
              <option value="diagnosis">Diagnosis</option><option value="surgery">Surgery</option><option value="er-visit">ER Visit</option><option value="vaccination">Vaccination</option><option value="hospitalization">Hospitalization</option>
            </select>
          </div>
          <div><Label className="text-slate-300 text-xs">Date</Label><Input className="bg-slate-800 border-slate-700 mt-1" type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Severity</Label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm mt-1" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
              <option value="routine">Routine</option><option value="significant">Significant</option><option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div><Label className="text-slate-300 text-xs">Title</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
        <div><Label className="text-slate-300 text-xs">Description</Label><Input className="bg-slate-800 border-slate-700 mt-1" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
      </CardContent></Card>}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No timeline events</p> : (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-800" />
          {items.map((e, i) => {
            const Icon = iconMap[e.icon || ''] || Heart;
            return (
              <div key={i} className="relative">
                <div className={`absolute -left-4 w-4 h-4 rounded-full flex items-center justify-center ${e.severity === 'critical' ? 'bg-red-500' : e.severity === 'significant' ? 'bg-amber-500' : 'bg-slate-600'}`}>
                  <Icon className="w-2 h-2 text-white" />
                </div>
                <Card className={`bg-slate-900 ${severityColors[e.severity || 'routine']}`}>
                  <CardContent className="pt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{e.eventType}</Badge>
                      {e.severity === 'critical' && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                      <span className="text-xs text-slate-500 ml-auto">{e.eventDate}</span>
                    </div>
                    <div className="font-medium text-sm">{e.title}</div>
                    <div className="text-xs text-slate-400">{e.description}</div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
