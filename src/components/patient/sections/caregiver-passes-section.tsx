'use client';

import { useState, useEffect } from 'react';
import { KeyRound, Plus, Trash2, QrCode, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
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
import type { CaregiverPassItem } from '@/stores/app-store';

const accessLevelConfig: Record<number, { label: string; color: string; icon: typeof Shield }> = {
  1: { label: 'Basic', color: 'bg-slate-800/50 text-slate-300 border-slate-700/50', icon: Shield },
  2: { label: 'Medications', color: 'bg-blue-950/50 text-blue-300 border-blue-800/50', icon: ShieldCheck },
  3: { label: 'Full Access', color: 'bg-amber-950/50 text-amber-300 border-amber-800/50', icon: ShieldAlert },
};

export function CaregiverPassesSection() {
  const { currentPatient } = useAppStore();
  const [passes, setPasses] = useState<CaregiverPassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    caregiverName: '',
    relationship: '',
    accessLevel: '1',
    expiresAt: '',
  });

  useEffect(() => {
    if (!currentPatient) return;
    const loadPasses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/patients/${currentPatient.id}/caregiver-passes`);
        if (res.ok) {
          const data = await res.json();
          setPasses(data.caregiverPasses || []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    loadPasses();
  }, [currentPatient]);

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!form.caregiverName.trim() || !form.relationship.trim()) {
      toast.error('Caregiver name and relationship are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/caregiver-passes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverName: form.caregiverName,
          relationship: form.relationship,
          accessLevel: parseInt(form.accessLevel),
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPasses([data.caregiverPass, ...passes]);
        toast.success('Caregiver pass issued');
        setShowForm(false);
        setForm({ caregiverName: '', relationship: '', accessLevel: '1', expiresAt: '' });
      } else {
        toast.error('Failed to issue pass');
      }
    } catch { toast.error('Failed to issue pass'); }
    setSaving(false);
  };

  const handleRevoke = async (passId: string) => {
    if (!confirm('Revoke this caregiver pass?')) return;
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/caregiver-passes/${passId}`, { method: 'DELETE' });
      if (res.ok) {
        setPasses(passes.filter(p => p.id !== passId));
        toast.success('Pass revoked');
      } else {
        toast.error('Failed to revoke pass');
      }
    } catch { toast.error('Failed to revoke pass'); }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  const isExpired = (d: string) => new Date(d) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-amber-400" />
            Caregiver Passes
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage access for designated caregivers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Issue Pass
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Caregiver Name *</Label>
              <Input value={form.caregiverName} onChange={(e) => setForm({ ...form, caregiverName: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Jane Doe" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Relationship *</Label>
              <Input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Spouse, Parent, Child" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Access Level</Label>
              <Select value={form.accessLevel} onValueChange={(v) => setForm({ ...form, accessLevel: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1">1 — Basic (demographics, contacts)</SelectItem>
                  <SelectItem value="2">2 — Medications (basic + meds, allergies)</SelectItem>
                  <SelectItem value="3">3 — Full Access (all medical data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Expires At</Label>
              <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? 'Issuing...' : 'Issue Pass'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading passes...</div>
      ) : passes.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No active caregiver passes</p>
          <p className="text-sm mt-1">Issue a pass to grant a caregiver access to your medical data</p>
        </div>
      ) : (
        <div className="space-y-3">
          {passes.map((pass) => {
            const al = accessLevelConfig[pass.accessLevel] || accessLevelConfig[1];
            const AccessIcon = al.icon;
            const expired = isExpired(pass.expiresAt);
            return (
              <div key={pass.id} className={`p-4 rounded-xl border ${expired ? 'bg-slate-800/30 border-slate-700/30 opacity-60' : al.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AccessIcon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pass.caregiverName}</span>
                        <Badge variant="outline" className="text-xs">{pass.relationship}</Badge>
                        <Badge variant="outline" className={`text-xs ${al.color}`}>
                          Level {pass.accessLevel} — {al.label}
                        </Badge>
                        {expired && (
                          <Badge variant="outline" className="text-xs bg-red-950/50 text-red-300 border-red-800/50">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <QrCode className="w-3 h-3" /> {pass.qrCode}
                        </span>
                        <span className="text-xs text-slate-400">Issued: {formatDate(pass.issuedAt)}</span>
                        <span className={`text-xs ${expired ? 'text-red-400' : 'text-slate-400'}`}>Expires: {formatDate(pass.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRevoke(pass.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
