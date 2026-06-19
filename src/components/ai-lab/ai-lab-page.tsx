'use client';
import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Zap, Shield, Scissors, ArrowLeft, Activity, Heart, Pill, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function AiLabPage() {
  const { currentPatient, setCurrentPage } = useAppStore();
  const [activeTool, setActiveTool] = useState<string>('diagnosis');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [symptoms, setSymptoms] = useState('');
  const [treatments, setTreatments] = useState('');
  const [procedureType, setProcedureType] = useState('');

  const tools = [
    { id: 'diagnosis', label: 'Differential Diagnosis', icon: Brain, desc: 'AI-powered diagnosis from symptoms + history' },
    { id: 'firewall', label: 'Treatment Firewall', icon: Shield, desc: 'Check planned treatments against vault data' },
    { id: 'checklist', label: 'Surgery Checklist', icon: Scissors, desc: 'Patient-specific pre-op checklist' },
    { id: 'reconciliation', label: 'Med Reconciliation', icon: Pill, desc: 'Check duplicates, gaps, interactions' },
    { id: 'discharge', label: 'Discharge Safety', icon: Activity, desc: 'Is it safe to go home?' },
  ];

  const runTool = async () => {
    if (!currentPatient) return;
    setLoading(true);
    setResults(null);
    try {
      let res: Response;
      switch (activeTool) {
        case 'diagnosis':
          res = await fetch('/api/ai/differential-diagnosis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: currentPatient.id, currentSymptoms: symptoms }) });
          break;
        case 'firewall':
          res = await fetch('/api/ai/treatment-firewall', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: currentPatient.id, plannedTreatments: treatments.split(',').map((t: string) => t.trim()) }) });
          break;
        case 'checklist':
          res = await fetch('/api/ai/surgery-checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: currentPatient.id, procedureType }) });
          break;
        case 'reconciliation':
          res = await fetch('/api/ai/medication-reconciliation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: currentPatient.id }) });
          break;
        case 'discharge':
          res = await fetch('/api/ai/discharge-assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: currentPatient.id, transportAvailable: true, pharmacyAccess: true, foodSecurity: true, socialSupport: true, healthLiteracy: 'moderate', followUpScheduled: false, homeHealthNeeded: false }) });
          break;
        default:
          res = await fetch('/api/ai/risk-score/' + currentPatient.id);
      }
      const data = await res.json();
      setResults(data);
    } catch { toast.error('AI tool failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('patient-dashboard')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-purple-400" /> AI Intelligence Lab</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Tool Selection */}
          <div className="space-y-2">
            {tools.map(t => (
              <button key={t.id} onClick={() => { setActiveTool(t.id); setResults(null); }}
                className={`w-full p-3 rounded-lg text-left transition-all ${activeTool === t.id ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-slate-900 border border-slate-800 hover:border-slate-700'}`}>
                <div className="flex items-center gap-2 mb-1"><t.icon className={`w-4 h-4 ${activeTool === t.id ? 'text-purple-400' : 'text-slate-500'}`} /><span className="font-medium text-sm">{t.label}</span></div>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </button>
            ))}
          </div>

          {/* Input & Results */}
          <div className="md:col-span-3 space-y-4">
            {/* Input Card */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-lg">{tools.find(t => t.id === activeTool)?.label}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {activeTool === 'diagnosis' && (
                  <div><Label className="text-slate-300 text-sm">Current Symptoms / Vitals</Label>
                    <Textarea className="bg-slate-800 border-slate-700 mt-1 min-h-[80px]" placeholder="e.g., Unconscious, chest pain, shortness of breath, BP 145/95, HR 110" value={symptoms} onChange={e => setSymptoms(e.target.value)} />
                  </div>
                )}
                {activeTool === 'firewall' && (
                  <div><Label className="text-slate-300 text-sm">Planned Treatments (comma-separated)</Label>
                    <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Morphine, CT with contrast, Intubation" value={treatments} onChange={e => setTreatments(e.target.value)} />
                  </div>
                )}
                {activeTool === 'checklist' && (
                  <div><Label className="text-slate-300 text-sm">Procedure Type</Label>
                    <Input className="bg-slate-800 border-slate-700 mt-1" placeholder="Emergency surgery, General anesthesia" value={procedureType} onChange={e => setProcedureType(e.target.value)} />
                  </div>
                )}
                <Button onClick={runTool} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  {loading ? 'Analyzing...' : <><Brain className="w-4 h-4 mr-1" />Run Analysis</>}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {results && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-purple-400" />Results</CardTitle></CardHeader>
                <CardContent>
                  {/* Diagnosis Results */}
                  {results.diagnoses && (
                    <div className="space-y-3">
                      {results.diagnoses.map((d: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg ${d.urgency === 'CRITICAL' ? 'bg-red-500/10 border border-red-500/30' : d.urgency === 'HIGH' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{d.condition}</span>
                            <Badge className={d.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>{d.urgency}</Badge>
                            <Badge variant="outline">{d.probability}%</Badge>
                          </div>
                          <p className="text-sm text-slate-300">{d.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Firewall Results */}
                  {results.conflicts && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg text-center ${results.safeToProceed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                        <div className={`text-xl font-bold ${results.safeToProceed ? 'text-green-400' : 'text-red-400'}`}>{results.safeToProceed ? '✅ SAFE TO PROCEED' : '⛔ CONFLICTS DETECTED'}</div>
                        <div className="text-sm text-slate-400">{results.criticalConflicts} critical, {results.totalConflicts} total</div>
                      </div>
                      {results.conflicts.map((c: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg ${c.severity === 'BLACK' || c.severity === 'RED' ? 'bg-red-500/10 border border-red-500/30' : c.severity === 'YELLOW' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive">{c.severity}</Badge>
                            <Badge variant="outline">{c.type}</Badge>
                          </div>
                          <p className="text-sm text-slate-300">{c.description}</p>
                          <p className="text-xs text-green-400 mt-1">Alternative: {c.alternative}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Checklist Results */}
                  {results.checklist && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-800 text-center">
                        <div className="text-xl font-bold">{results.readinessScore}% Ready</div>
                        <div className="text-xs text-slate-400">{results.summary.totalItems} items • {results.summary.criticalItems} critical</div>
                      </div>
                      {results.checklist.map((cat: any, i: number) => (
                        <div key={i} className="space-y-1">
                          <h4 className="font-medium text-sm text-slate-300">{cat.category}</h4>
                          {cat.items.map((item: any, j: number) => (
                            <div key={j} className={`p-2 rounded text-sm ${item.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-300' : item.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                              {item.priority === 'CRITICAL' && '🔴 '}{item.text}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reconciliation Results */}
                  {results.issues && (
                    <div className="space-y-2">
                      {results.issues.map((issue: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg ${issue.severity === 'danger' ? 'bg-red-500/10 border border-red-500/30' : issue.severity === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800'}`}>
                          <Badge className={issue.severity === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>{issue.type}</Badge>
                          <p className="text-sm text-slate-300 mt-1">{issue.description}</p>
                          <p className="text-xs text-green-400 mt-1">→ {issue.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discharge Results */}
                  {results.dischargeSafetyScore !== undefined && !results.diagnoses && !results.conflicts && !results.checklist && !results.issues && (
                    <div className="text-center space-y-4">
                      <div className={`text-5xl font-bold ${results.level === 'safe' ? 'text-green-400' : results.level === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>{results.dischargeSafetyScore}</div>
                      <div className="text-slate-400">/100 Discharge Safety Score</div>
                      <Badge className={results.level === 'safe' ? 'bg-green-500/20 text-green-400 text-base' : results.level === 'warning' ? 'bg-amber-500/20 text-amber-400 text-base' : 'bg-red-500/20 text-red-400 text-base'}>
                        {results.recommendation}
                      </Badge>
                      {results.risks?.length > 0 && <div className="mt-4 text-left"><h4 className="font-medium text-sm mb-2">Risks:</h4>{results.risks.map((r: string, i: number) => <div key={i} className="text-sm text-red-300">• {r}</div>)}</div>}
                      {results.interventions?.length > 0 && <div className="mt-4 text-left"><h4 className="font-medium text-sm mb-2">Interventions:</h4>{results.interventions.map((r: string, i: number) => <div key={i} className="text-sm text-green-300">• {r}</div>)}</div>}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
