'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Activity, Heart, AlertTriangle, Users, Shield, Brain, Pill, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnalyticsPage() {
  const { currentPatient, setCurrentPage } = useAppStore();
  if (!currentPatient) return null;

  const age = Math.floor((Date.now() - new Date(currentPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  // Compute analytics from patient data
  const conditionClusters = currentPatient.conditions.reduce((acc, c) => {
    const cluster = c.cluster || 'other';
    acc[cluster] = (acc[cluster] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clusterData = Object.entries(conditionClusters).map(([name, value]) => ({ name, value }));
  const clusterColors: Record<string, string> = { cardiac: '#ef4444', metabolic: '#f97316', respiratory: '#3b82f6', mental_health: '#a855f7', neurological: '#ec4899', other: '#64748b' };

  const adherenceData = (currentPatient.medicationAdherence || []).map(a => ({ name: a.medicationName.slice(0, 15), score: a.overallScore }));

  const timelineByYear = (currentPatient.medicalTimeline || []).reduce((acc, e) => {
    const year = e.eventDate.slice(0, 4);
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const timelineData = Object.entries(timelineByYear).map(([year, count]) => ({ year, events: count }));

  const riskFactors = [
    { label: 'Allergies (severe)', value: currentPatient.allergies.filter(a => a.severity === 'severe' || a.severity === 'life-threatening').length, color: 'text-red-400' },
    { label: 'Genetic Flags', value: (currentPatient.geneticFlags || []).length, color: 'text-purple-400' },
    { label: 'Active Conditions', value: currentPatient.conditions.filter(c => c.status === 'active' || c.status === 'chronic').length, color: 'text-amber-400' },
    { label: 'Medications', value: currentPatient.medications.length, color: 'text-blue-400' },
    { label: 'Implants', value: currentPatient.implants.length, color: 'text-cyan-400' },
    { label: 'DNR Active', value: currentPatient.dnr ? 1 : 0, color: 'text-red-500' },
  ];

  const vaultCompleteness = Math.round(
    ((currentPatient.allergies.length > 0 ? 15 : 0) +
    (currentPatient.medications.length > 0 ? 15 : 0) +
    (currentPatient.conditions.length > 0 ? 10 : 0) +
    (currentPatient.emergencyContacts.length > 0 ? 15 : 0) +
    (currentPatient.consentProxies.length > 0 ? 10 : 0) +
    ((currentPatient.pharmacogenomics || []).length > 0 ? 10 : 0) +
    ((currentPatient.vitalBaselines || []).length > 0 ? 10 : 0) +
    ((currentPatient.voiceMessages || []).length > 0 ? 5 : 0) +
    ((currentPatient.advanceDirectives || []).length > 0 ? 5 : 0) +
    ((currentPatient.culturalDirectives || []).length > 0 ? 5 : 0))
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('patient-dashboard')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6 text-emerald-400" /> Vault Analytics</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4 text-center">
            <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-emerald-400">{vaultCompleteness}%</div>
            <div className="text-xs text-slate-500">Vault Complete</div>
          </CardContent></Card>
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4 text-center">
            <Heart className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <div className="text-2xl font-bold">{age}</div>
            <div className="text-xs text-slate-500">Age</div>
          </CardContent></Card>
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-400">{riskFactors.reduce((s, r) => s + r.value, 0)}</div>
            <div className="text-xs text-slate-500">Risk Factors</div>
          </CardContent></Card>
          <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-4 text-center">
            <Zap className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-400">{(currentPatient.geneticFlags || []).length + (currentPatient.pharmacogenomics || []).length}</div>
            <div className="text-xs text-slate-500">Genetic Data Points</div>
          </CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Condition Clusters */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-3">Condition Clusters</h3>
              {clusterData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart><Pie data={clusterData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {clusterData.map((entry, i) => <Cell key={i} fill={clusterColors[entry.name] || '#64748b'} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-500 text-sm">No conditions clustered</p>}
            </CardContent>
          </Card>

          {/* Medication Adherence */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-3">Medication Adherence Scores</h3>
              {adherenceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={adherenceData}><XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis domain={[0, 100]} tick={{ fill: '#94a3b8' }} /><Tooltip /><Bar dataKey="score" fill="#22c55e" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-500 text-sm">No adherence data</p>}
            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-3">Risk Factor Breakdown</h3>
              <div className="space-y-2">
                {riskFactors.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                    <span className="text-sm text-slate-300">{r.label}</span>
                    <span className={`font-bold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-3">Events by Year</h3>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timelineData}><XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis tick={{ fill: '#94a3b8' }} /><Tooltip /><Bar dataKey="events" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-500 text-sm">No timeline data</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
