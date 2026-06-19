'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cpu, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function DeviceIntegrationsSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ deviceType: '', deviceName: '', manufacturer: '', lastSyncDate: '', batteryLevel: 0, dataSummary: '' });
  const items = currentPatient?.deviceIntegrations || [];
  const handleAdd = async () => {
    if (!currentPatient || !form.deviceName) return;
    const res = await fetch(`/api/patients/${currentPatient.id}/sub/device-integrations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await fetchPatient(currentPatient.id); setAdding(false); toast.success('Added'); } else toast.error('Failed');
  };
  const typeColors: Record<string, string> = { cgm: 'bg-green-500/20 text-green-400', 'insulin-pump': 'bg-blue-500/20 text-blue-400', pacemaker: 'bg-red-500/20 text-red-400', 'smart-inhaler': 'bg-cyan-500/20 text-cyan-400', 'smart-watch': 'bg-purple-500/20 text-purple-400' };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h2 className="text-xl font-bold flex items-center gap-2"><Cpu className="w-5 h-5 text-cyan-400" /> Connected Devices</h2><p className="text-sm text-slate-400">Medical devices that feed real-time data</p></div>
        <Button size="sm" onClick={() => setAdding(!adding)}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>
      {adding && <Card className="mb-4 bg-slate-900 border-slate-800"><CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-slate-300 text-xs">Device Type</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="cgm" value={form.deviceType} onChange={e => setForm({...form, deviceType: e.target.value})} /></div>
          <div><Label className="text-slate-300 text-xs">Device Name</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Dexcom G7" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} /></div>
        </div>
        <div><Label className="text-slate-300 text-xs">Data Summary (JSON)</Label><Input className="bg-slate-800 border-slate-700 mt-1" placeholder='{"glucose": 145}' value={form.dataSummary} onChange={e => setForm({...form, dataSummary: e.target.value})} /></div>
        <div className="flex gap-2"><Button size="sm" onClick={handleAdd}>Save</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
      </CardContent></Card>}
      {items.length === 0 ? <p className="text-slate-500 text-sm">No devices connected</p> : (
        <div className="grid grid-cols-2 gap-3">{items.map((d, i) => {
          let dataPreview: any = null;
          try { dataPreview = JSON.parse(d.dataSummary || '{}'); } catch {}
          return (
            <Card key={i} className="bg-slate-900 border-slate-800"><CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2"><Badge className={typeColors[d.deviceType] || 'bg-slate-500/20 text-slate-400'}>{d.deviceType}</Badge><span className="font-medium text-sm">{d.deviceName}</span></div>
              {d.batteryLevel != null && <div className="text-xs text-slate-500">Battery: {d.batteryLevel}%</div>}
              {dataPreview && Object.keys(dataPreview).length > 0 && (
                <div className="mt-2 p-2 bg-slate-800 rounded text-xs font-mono text-slate-400">
                  {Object.entries(dataPreview).slice(0, 4).map(([k, v]) => <div key={k}>{k}: {String(v)}</div>)}
                </div>
              )}
            </CardContent></Card>
          );
        })}</div>
      )}
    </div>
  );
}
