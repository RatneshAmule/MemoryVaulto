'use client';

import { useState } from 'react';
import { Plus, Trash2, Cpu } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ImplantsSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [implantDate, setImplantDate] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!name.trim() || !implantDate) { toast.error('Name and implant date are required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/implants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, implantDate, manufacturer, serialNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, implants: [...currentPatient.implants, data.implant] });
        setName(''); setImplantDate(''); setManufacturer(''); setSerialNumber(''); setShowForm(false);
        toast.success('Implant added');
      } else { toast.error('Failed to add implant'); }
    } catch { toast.error('Failed to add implant'); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/implants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, implants: currentPatient.implants.filter((i) => i.id !== id) });
        toast.success('Implant removed');
      }
    } catch { toast.error('Failed to remove implant'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Implants</h2>
          <p className="text-slate-400 text-sm mt-1">Medical implants and devices</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Implant
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Implant Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Coronary Stent" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Implant Date</Label>
              <Input type="date" value={implantDate} onChange={(e) => setImplantDate(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Manufacturer</Label>
              <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Abbott" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Serial Number</Label>
              <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="Serial number" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Adding...' : 'Add Implant'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {currentPatient.implants.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No implants recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPatient.implants.map((implant) => (
            <div key={implant.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-medium">{implant.name}</span>
                  <p className="text-sm text-slate-400 mt-0.5">Implanted: {implant.implantDate}</p>
                  <div className="flex gap-3 mt-1 text-xs text-slate-500">
                    {implant.manufacturer && <span>Manufacturer: {implant.manufacturer}</span>}
                    {implant.serialNumber && <span>Serial: {implant.serialNumber}</span>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(implant.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
