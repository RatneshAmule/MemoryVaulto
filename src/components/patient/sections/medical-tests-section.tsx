'use client';

import { useState, useEffect } from 'react';
import { FlaskConical, Plus, Trash2, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
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
import type { MedicalTestItem } from '@/stores/app-store';

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  completed: { color: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50', icon: CheckCircle },
  ordered: { color: 'bg-blue-950/50 text-blue-300 border-blue-800/50', icon: Clock },
  cancelled: { color: 'bg-slate-800/50 text-slate-400 border-slate-700/50', icon: XCircle },
};

export function MedicalTestsSection() {
  const { currentPatient, fetchPatient } = useAppStore();
  const [tests, setTests] = useState<MedicalTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    testName: '',
    testDate: '',
    facility: '',
    results: '',
    orderingDoc: '',
    status: 'ordered',
    radiationDose: '',
  });

  useEffect(() => {
    if (!currentPatient) return;
    const loadTests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/patients/${currentPatient.id}/tests`);
        if (res.ok) {
          const data = await res.json();
          setTests(data.tests || []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    loadTests();
  }, [currentPatient]);

  if (!currentPatient) return null;

  const handleAdd = async () => {
    if (!form.testName.trim() || !form.testDate) {
      toast.error('Test name and date are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          radiationDose: form.radiationDose ? parseFloat(form.radiationDose) : undefined,
        }),
      });
      if (res.status === 409) {
        const data = await res.json();
        if (confirm(data.warning)) {
          const overrideRes = await fetch(`/api/patients/${currentPatient.id}/tests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, override: true, radiationDose: form.radiationDose ? parseFloat(form.radiationDose) : undefined }),
          });
          if (overrideRes.ok) {
            const data2 = await overrideRes.json();
            setTests([data2.test, ...tests]);
            toast.success('Test added (override)');
          }
        }
      } else if (res.ok) {
        const data = await res.json();
        setTests([data.test, ...tests]);
        toast.success('Test ordered');
        setShowForm(false);
        setForm({ testName: '', testDate: '', facility: '', results: '', orderingDoc: '', status: 'ordered', radiationDose: '' });
      } else {
        toast.error('Failed to add test');
      }
    } catch { toast.error('Failed to add test'); }
    setSaving(false);
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Delete this test?')) return;
    try {
      const res = await fetch(`/api/patients/${currentPatient.id}/medical-tests/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        setTests(tests.filter(t => t.id !== testId));
        toast.success('Test removed');
      } else {
        toast.error('Failed to delete test');
      }
    } catch { toast.error('Failed to delete test'); }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            Medical Tests
          </h2>
          <p className="text-slate-400 text-sm mt-1">Lab tests, imaging, and diagnostic procedures</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Order Test
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 text-sm">Test Name *</Label>
              <Input value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., CBC, CT Scan, MRI" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Test Date *</Label>
              <Input type="date" value={form.testDate} onChange={(e) => setForm({ ...form, testDate: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Facility</Label>
              <Input value={form.facility} onChange={(e) => setForm({ ...form, facility: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., City Hospital Radiology" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Ordering Doctor</Label>
              <Input value={form.orderingDoc} onChange={(e) => setForm({ ...form, orderingDoc: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Dr. Smith" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Radiation Dose (mSv)</Label>
              <Input type="number" step="0.1" value={form.radiationDose} onChange={(e) => setForm({ ...form, radiationDose: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., 7.0" />
            </div>
          </div>
          {form.status === 'completed' && (
            <div>
              <Label className="text-slate-300 text-sm">Results</Label>
              <Input value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} className="bg-slate-900 border-slate-700 text-white mt-1.5" placeholder="e.g., Normal, Abnormal - see report" />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              {saving ? 'Saving...' : 'Order Test'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No medical tests recorded</p>
          <p className="text-sm mt-1">Order a test to start tracking diagnostics</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => {
            const sc = statusConfig[test.status] || statusConfig.ordered;
            const StatusIcon = sc.icon;
            return (
              <div key={test.id} className={`p-4 rounded-xl border ${sc.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{test.testName}</span>
                        <Badge variant="outline" className={`text-xs ${sc.color}`}>
                          {test.status}
                        </Badge>
                        {test.radiationDose != null && test.radiationDose > 0 && (
                          <Badge variant="outline" className="text-xs bg-amber-950/50 text-amber-300 border-amber-800/50">
                            {test.radiationDose} mSv
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        <span className="text-xs text-slate-400">{formatDate(test.testDate)}</span>
                        {test.facility && <span className="text-xs text-slate-400">{test.facility}</span>}
                        {test.orderingDoc && <span className="text-xs text-slate-400">Ord: {test.orderingDoc}</span>}
                      </div>
                      {test.results && <p className="text-xs text-slate-300 mt-1">Results: {test.results}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(test.id)} className="text-slate-400 hover:text-red-400 h-8 w-8 p-0">
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
