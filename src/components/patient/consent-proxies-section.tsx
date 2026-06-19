'use client';

import { useState } from 'react';
import { Plus, Trash2, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ConsentProxiesSection() {
  const { currentPatient, setCurrentPatient } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proxyName, setProxyName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState('1');

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!proxyName.trim() || !relationship.trim() || !phone.trim()) {
      toast.error('Proxy name, relationship, and phone are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/consent-proxies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxyName, relationship, phone, priority: parseInt(priority) }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPatient({
          ...currentPatient,
          consentProxies: [...currentPatient.consentProxies, data.proxy].sort((a, b) => a.priority - b.priority),
        });
        setProxyName(''); setRelationship(''); setPhone(''); setPriority('1'); setShowForm(false);
        toast.success('Consent proxy added');
      } else { toast.error('Failed to add consent proxy'); }
    } catch { toast.error('Failed to add consent proxy'); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/consent-proxies`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxyId: id }),
      });
      if (res.ok) {
        setCurrentPatient({ ...currentPatient, consentProxies: currentPatient.consentProxies.filter((p) => p.id !== id) });
        toast.success('Consent proxy removed');
      }
    } catch { toast.error('Failed to remove consent proxy'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Consent Proxies</h2>
          <p className="text-slate-400 text-sm mt-1">People authorized to make medical decisions on your behalf</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Proxy
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Proxy Name</Label>
              <Input value={proxyName} onChange={(e) => setProxyName(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="Full name" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Relationship</Label>
              <Input value={relationship} onChange={(e) => setRelationship(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Husband, Daughter" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="(555) 123-4567" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Priority</Label>
              <Input type="number" min="1" max="10" value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? 'Adding...' : 'Add Proxy'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {currentPatient.consentProxies.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No consent proxies recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentPatient.consentProxies.map((proxy) => (
            <div key={proxy.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-900/30 border border-amber-700/30 flex items-center justify-center text-sm font-bold text-amber-300">
                  {proxy.priority}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{proxy.proxyName}</span>
                    <span className="text-xs text-slate-400">({proxy.relationship})</span>
                    {proxy.verified ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <AlertCircle className="w-3 h-3" /> Unverified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">{proxy.phone}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(proxy.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
