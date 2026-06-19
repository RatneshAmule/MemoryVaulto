'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, Heart, Brain, Pill, Phone, FileCheck, Battery, Syringe,
  Dna, Activity, Droplets, Globe, Mic, FileText, Cpu, Clock, ArrowLeft, Zap,
  Play, Scissors, Thermometer, Radiation, HardHat, Users, ChevronDown, ChevronUp,
  PhoneCall, Loader2, Flame
} from 'lucide-react';
import { toast } from 'sonner';

export function EmergencyPortal() {
  const { currentPatient, currentUser, setCurrentPage } = useAppStore();
  const [firewallResults, setFirewallResults] = useState<any>(null);
  const [diagnosisResults, setDiagnosisResults] = useState<any>(null);
  const [checklistResults, setChecklistResults] = useState<any>(null);
  const [symptoms, setSymptoms] = useState('');
  const [plannedMeds, setPlannedMeds] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('red-flags');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [accessLogged, setAccessLogged] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyResult, setNotifyResult] = useState<any>(null);

  const p = currentPatient;

  // Log emergency access when portal loads
  useEffect(() => {
    if (p && currentUser && !accessLogged) {
      const logAccess = async () => {
        try {
          await fetch(`/api/emergency/${p.id}/access`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessorId: currentUser.id,
              accessType: 'emergency',
              accessMethod: 'search',
              reason: 'Emergency vault access via portal',
              dataViewed: ['profile', 'allergies', 'medications', 'conditions', 'surgeries', 'implants'],
            }),
          });
          setAccessLogged(true);
          toast.success('Emergency access logged. This access will auto-expire in 24 hours.', { duration: 4000 });
        } catch (e) {
          console.error('Failed to log access:', e);
        }
      };
      logAccess();
    }
  }, [p, currentUser, accessLogged]);

  // Fetch risk score
  useEffect(() => {
    if (p && !riskScore && !riskLoading) {
      setRiskLoading(true);
      fetch(`/api/ai/risk-score/${p.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.score !== undefined) setRiskScore(data);
        })
        .catch(e => console.error('Risk score fetch error:', e))
        .finally(() => setRiskLoading(false));
    }
  }, [p, riskScore, riskLoading]);

  if (!p) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">No patient selected</div>;

  const age = Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  // Auto-flags
  const redFlags = [
    ...p.allergies.filter((a: any) => a.severity === 'severe' || a.severity === 'life-threatening').map((a: any) => ({ type: 'allergy', label: `ALLERGY: ${a.name}`, detail: `${a.severity} — ${a.reaction || 'unknown reaction'}${a.crossReactivity ? ` | Cross-reacts: ${a.crossReactivity}` : ''}`, severity: 'critical' })),
    ...p.geneticFlags?.map((g: any) => ({ type: 'genetic', label: `GENETIC: ${g.condition}`, detail: `AVOID: ${g.medicationsToAvoid} | SAFE: ${g.safeAlternatives}`, severity: 'critical' })) || [],
    ...p.pharmacogenomics?.map((pg: any) => ({ type: 'pharm', label: `${pg.gene}: ${pg.variant}`, detail: pg.implications, severity: 'warning' })) || [],
    ...(p.dnr ? [{ type: 'dnr', label: 'DNR / DO NOT RESUSCITATE', detail: 'Comfort care only. Do not intubate or resuscitate.', severity: 'critical' }] : []),
    ...(p.organDonor ? [{ type: 'donor', label: 'ORGAN DONOR', detail: 'Registered organ and tissue donor', severity: 'info' }] : []),
    ...(p.pregnancyStatus === 'confirmed' || p.pregnancyStatus === 'possible' ? [{ type: 'pregnancy', label: `PREGNANCY: ${p.pregnancyStatus?.toUpperCase()}`, detail: 'Pregnancy-safe treatment pathway required. Avoid teratogenic medications. Shield abdomen for imaging.', severity: 'critical' }] : []),
    ...p.culturalDirectives?.filter((c: any) => !c.overrideAllowed).map((c: any) => ({ type: 'cultural', label: `${c.religion}: ${c.directive}`, detail: c.description, severity: 'critical' })) || [],
    ...p.implants.filter((i: any) => !i.mriSafe).map((i: any) => ({ type: 'implant', label: `NO MRI: ${i.name} at ${i.bodyLocation}`, detail: 'This implant is NOT MRI-safe. Use alternative imaging.', severity: 'critical' })) || [],
  ];

  // Notify family
  const handleNotifyFamily = async () => {
    if (!currentUser) return;
    setNotifying(true);
    try {
      const res = await fetch('/api/emergency/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: p.id,
          accessorId: currentUser.id,
          message: `Emergency access initiated by ${currentUser.name} (${currentUser.role}) at ${new Date().toLocaleString()}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifyResult(data);
        toast.success(`Family notification cascade initiated for ${data.cascade?.length || 0} contacts`, { duration: 5000 });
      } else {
        toast.error('Failed to notify family contacts');
      }
    } catch {
      toast.error('Notification failed');
    } finally {
      setNotifying(false);
    }
  };

  const runFirewall = async () => {
    if (!plannedMeds) return;
    const res = await fetch('/api/ai/treatment-firewall', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: p.id, plannedTreatments: plannedMeds.split(',').map((t: string) => t.trim()) }) });
    const data = await res.json();
    setFirewallResults(data);
  };

  const runDiagnosis = async () => {
    if (!symptoms) return;
    const res = await fetch('/api/ai/differential-diagnosis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: p.id, currentSymptoms: symptoms }) });
    const data = await res.json();
    setDiagnosisResults(data);
  };

  const runChecklist = async () => {
    const res = await fetch('/api/ai/surgery-checklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: p.id, procedureType: 'emergency' }) });
    const data = await res.json();
    setChecklistResults(data);
  };

  const playVoice = (transcript: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (playingVoice === id) { speechSynthesis.cancel(); setPlayingVoice(null); return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(transcript);
      u.rate = 0.9;
      u.onend = () => setPlayingVoice(null);
      speechSynthesis.speak(u);
      setPlayingVoice(id);
    }
  };

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  // Risk score color/label helpers
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-400';
      case 'ELEVATED': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };
  const getRiskBg = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500/10 border-green-500/30';
      case 'ELEVATED': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'HIGH': return 'bg-orange-500/10 border-orange-500/30';
      case 'CRITICAL': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-slate-800 border-slate-700';
    }
  };
  const getRiskProgressColor = (level: string) => {
    switch (level) {
      case 'LOW': return '[&>div]:bg-green-500';
      case 'ELEVATED': return '[&>div]:bg-yellow-500';
      case 'HIGH': return '[&>div]:bg-orange-500';
      case 'CRITICAL': return '[&>div]:bg-red-500';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Emergency Header */}
      <div className="bg-red-900/30 border-b border-red-500/30 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => setCurrentPage('hospital')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-3 h-3 rounded-full bg-red-500" />
            <span className="font-bold text-red-400">EMERGENCY VAULT ACCESS</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {accessLogged && (
            <Badge className="bg-green-500/20 text-green-400">
              <Shield className="w-3 h-3 mr-1" />Access Logged
            </Badge>
          )}
          <Badge variant="destructive">{currentUser?.role}</Badge>
          <Badge variant="outline" className="text-slate-300">{new Date().toLocaleTimeString()}</Badge>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Patient Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Card className="bg-slate-900 border-red-500/30">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Heart className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{p.user?.name}</h1>
                  <div className="text-sm text-slate-400">{age}yo {p.gender} • {p.primaryLanguage}{p.nationality ? ` • ${p.nationality}` : ''}</div>
                </div>
                <div className="flex flex-wrap gap-2 ml-auto">
                  <Badge className="text-base bg-red-500/20 text-red-400 px-3 py-1">Blood: {p.bloodType}{p.rhFactor || ''}</Badge>
                  {p.weight && <Badge variant="outline" className="px-3 py-1">{p.weight}kg</Badge>}
                  {p.dnr && <Badge variant="destructive" className="px-3 py-1">DNR</Badge>}
                  {p.organDonor && <Badge className="bg-green-500/20 text-green-400 px-3 py-1">Organ Donor</Badge>}
                  {p.veteranStatus && <Badge className="bg-blue-500/20 text-blue-400 px-3 py-1">Veteran</Badge>}
                  {p.refugeeStatus && <Badge className="bg-amber-500/20 text-amber-400 px-3 py-1">Refugee</Badge>}
                  {p.pregnancyStatus && p.pregnancyStatus !== 'not-pregnant' && <Badge className="bg-pink-500/20 text-pink-400 px-3 py-1">Pregnant: {p.pregnancyStatus}</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Score + Notify Family Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Risk Score Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className={`bg-slate-900 ${riskScore ? getRiskBg(riskScore.level) : 'border-slate-800'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  AI Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {riskLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    <span className="ml-2 text-slate-400">Calculating risk...</span>
                  </div>
                ) : riskScore ? (
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`text-4xl font-bold ${getRiskColor(riskScore.level)}`}>
                        {riskScore.score}
                      </div>
                      <div>
                        <Badge className={`${riskScore.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : riskScore.level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : riskScore.level === 'ELEVATED' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                          {riskScore.level}
                        </Badge>
                        <div className="text-xs text-slate-500 mt-1">out of 100</div>
                      </div>
                    </div>
                    <Progress value={riskScore.score} className={`h-2 mb-3 ${getRiskProgressColor(riskScore.level)}`} />
                    {riskScore.factors?.length > 0 && (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {riskScore.factors.slice(0, 5).map((f: any, i: number) => (
                          <div key={i} className="text-xs text-slate-400">
                            <Badge variant="outline" className="text-[10px] mr-1">{f.category}</Badge>
                            {f.name} (+{f.points})
                          </div>
                        ))}
                        {riskScore.factors.length > 5 && (
                          <div className="text-xs text-slate-500">+{riskScore.factors.length - 5} more factors</div>
                        )}
                      </div>
                    )}
                    {riskScore.recommendations?.length > 0 && (
                      <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-300">
                        <strong>Rec: </strong>{riskScore.recommendations[0]}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm text-center py-4">Unable to calculate risk score</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notify Family Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-slate-900 border-teal-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-teal-400" />
                  Notify Family / Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-400 mb-3">
                  Initiate a notification cascade to all emergency contacts on file. Contacts are notified in priority order.
                </p>
                <div className="space-y-2 mb-3">
                  {p.emergencyContacts.slice(0, 3).map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                        <Phone className="w-3 h-3 text-teal-400" />
                      </div>
                      <span className="text-slate-300">{c.name}</span>
                      <span className="text-slate-500">({c.relationship})</span>
                      <span className="text-teal-400 ml-auto">{c.phone}</span>
                    </div>
                  ))}
                  {p.emergencyContacts.length > 3 && (
                    <div className="text-xs text-slate-500">+{p.emergencyContacts.length - 3} more contacts</div>
                  )}
                </div>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={handleNotifyFamily}
                  disabled={notifying}
                >
                  {notifying ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending Notifications...</>
                  ) : (
                    <><PhoneCall className="w-4 h-4 mr-2" />Notify Family</>
                  )}
                </Button>
                {notifyResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="text-xs text-green-400 font-medium mb-1">✅ Notification Cascade Initiated</div>
                    {notifyResult.cascade?.map((c: any, i: number) => (
                      <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">P{c.priority}</Badge>
                        <span>{c.name}</span>
                        <span className="text-green-400 ml-auto">Notified ({c.delay})</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Red Flags - Always Visible */}
        <div className="mb-4">
          <button onClick={() => toggleSection('red-flags')} className="w-full flex items-center justify-between p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" /><span className="font-bold text-red-400">CRITICAL RED FLAGS ({redFlags.length})</span></div>
            {expandedSection === 'red-flags' ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
          </button>
          {expandedSection === 'red-flags' && (
            <div className="mt-2 space-y-2">
              {redFlags.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className={`p-3 rounded-lg ${f.severity === 'critical' ? 'bg-red-500/10 border border-red-500/30' : f.severity === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                    <div className="font-bold text-sm">{f.label}</div>
                    <div className="text-xs text-slate-300">{f.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Voice of the Patient */}
        {p.voiceMessages?.length > 0 && (
          <div className="mb-4">
            <button onClick={() => toggleSection('voice')} className="w-full flex items-center justify-between p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2"><Mic className="w-5 h-5 text-red-400" /><span className="font-bold text-red-300">🎙️ VOICE OF THE PATIENT</span></div>
              {expandedSection === 'voice' ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
            </button>
            {expandedSection === 'voice' && (
              <div className="mt-2 space-y-2">
                {p.voiceMessages.map((msg: any, i: number) => (
                  <Card key={i} className="bg-slate-900 border-red-500/20"><CardContent className="pt-3">
                    <div className="flex items-center gap-2 mb-2"><Badge className="bg-red-500/20 text-red-400">{msg.category}</Badge><span className="font-medium">{msg.title}</span></div>
                    <p className="text-sm text-slate-300 italic mb-2">"{msg.transcript}"</p>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400" onClick={() => playVoice(msg.transcript, msg.id)}>
                      {playingVoice === msg.id ? <><Zap className="w-3 h-3 mr-1" />Playing...</> : <><Play className="w-3 h-3 mr-1" />Play Voice</>}
                    </Button>
                  </CardContent></Card>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Column - Patient Data */}
          <div className="space-y-3">
            {/* Medications */}
            <CollapsibleSection title="Medications" icon={Pill} count={p.medications.length} id="meds" expanded={expandedSection} toggle={toggleSection}>
              {p.medications.map((m: any, i: number) => (
                <div key={i} className="p-2 bg-slate-800 rounded flex items-center justify-between">
                  <div><span className="font-medium text-sm">{m.name}</span><span className="text-slate-500 ml-2">{m.dose} {m.frequency}</span></div>
                  <div className="flex gap-1">{m.isOpioid && <Badge variant="destructive" className="text-[10px]">Opioid</Badge>}{m.isPsychMed && <Badge className="text-[10px] bg-purple-500/20 text-purple-400">Psych</Badge>}</div>
                </div>
              ))}
            </CollapsibleSection>

            {/* Conditions */}
            <CollapsibleSection title="Conditions" icon={Heart} count={p.conditions.length} id="conditions" expanded={expandedSection} toggle={toggleSection}>
              {p.conditions.map((c: any, i: number) => (
                <div key={i} className="p-2 bg-slate-800 rounded flex items-center justify-between">
                  <span className="text-sm">{c.name}</span>
                  <div className="flex gap-1"><Badge variant="outline" className="text-[10px]">{c.status}</Badge>{c.cluster && <Badge className="text-[10px] bg-blue-500/20 text-blue-400">{c.cluster}</Badge>}</div>
                </div>
              ))}
            </CollapsibleSection>

            {/* Implants */}
            <CollapsibleSection title="Implants" icon={Battery} count={p.implants.length} id="implants" expanded={expandedSection} toggle={toggleSection}>
              {p.implants.map((im: any, i: number) => (
                <div key={i} className={`p-2 rounded ${im.mriSafe ? 'bg-slate-800' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="font-medium text-sm">{im.name} <Badge variant="outline" className="text-[10px]">{im.bodyLocation}</Badge></div>
                  <div className="text-xs text-slate-500">{im.manufacturer} {im.serialNumber && `• S/N: ${im.serialNumber}`} {!im.mriSafe && '• ⛔ NO MRI'}</div>
                </div>
              ))}
            </CollapsibleSection>

            {/* Emergency Contacts */}
            <CollapsibleSection title="Emergency Contacts" icon={Phone} count={p.emergencyContacts.length} id="contacts" expanded={expandedSection} toggle={toggleSection}>
              {p.emergencyContacts.map((c: any, i: number) => (
                <div key={i} className="p-2 bg-slate-800 rounded flex items-center justify-between">
                  <div><span className="font-medium text-sm">{c.name}</span><span className="text-slate-500 ml-2">{c.relationship}</span></div>
                  <div className="text-right"><div className="text-sm text-teal-400">{c.phone}</div>{c.language && <div className="text-xs text-slate-500">{c.language}</div>}</div>
                </div>
              ))}
            </CollapsibleSection>

            {/* Vital Baselines */}
            {p.vitalBaselines?.length > 0 && (
              <CollapsibleSection title="Vital Baselines" icon={Activity} count={p.vitalBaselines.length} id="vitals" expanded={expandedSection} toggle={toggleSection}>
                <div className="grid grid-cols-2 gap-2">
                  {p.vitalBaselines.map((v: any, i: number) => (
                    <div key={i} className="p-2 bg-slate-800 rounded text-center">
                      <div className="text-xs text-slate-500">{v.vitalType.replace(/_/g, ' ')}</div>
                      <div className="text-lg font-bold text-green-400">{v.value}</div>
                      <div className="text-[10px] text-slate-500">{v.unit} • baseline</div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Devices */}
            {p.deviceIntegrations?.length > 0 && (
              <CollapsibleSection title="Connected Devices" icon={Cpu} count={p.deviceIntegrations.length} id="devices" expanded={expandedSection} toggle={toggleSection}>
                {p.deviceIntegrations.map((d: any, i: number) => {
                  let data: any = null;
                  try { data = JSON.parse(d.dataSummary || '{}'); } catch {}
                  return (
                    <div key={i} className="p-2 bg-slate-800 rounded">
                      <div className="flex items-center gap-2 mb-1"><Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">{d.deviceType}</Badge><span className="text-sm font-medium">{d.deviceName}</span></div>
                      {data && Object.keys(data).length > 0 && <div className="text-xs text-slate-400 font-mono">{Object.entries(data).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' • ')}</div>}
                    </div>
                  );
                })}
              </CollapsibleSection>
            )}

            {/* Cultural Directives */}
            {p.culturalDirectives?.length > 0 && (
              <CollapsibleSection title="Cultural Directives" icon={Globe} count={p.culturalDirectives.length} id="cultural" expanded={expandedSection} toggle={toggleSection}>
                {p.culturalDirectives.map((c: any, i: number) => (
                  <div key={i} className={`p-2 rounded ${c.overrideAllowed ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="font-medium text-sm">{c.religion}: {c.directive}</div>
                    <div className="text-xs text-slate-400">{c.description}</div>
                    {!c.overrideAllowed && <div className="text-xs text-red-400 font-bold">OVERRIDE NOT ALLOWED</div>}
                  </div>
                ))}
              </CollapsibleSection>
            )}
          </div>

          {/* Right Column - AI Tools */}
          <div className="space-y-3">
            {/* AI Diagnosis */}
            <Card className="bg-slate-900 border-purple-500/30">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-purple-400" />AI Differential Diagnosis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input className="bg-slate-800 border-slate-700" placeholder="Enter symptoms (e.g., unconscious, chest pain)" value={symptoms} onChange={e => setSymptoms(e.target.value)} />
                <Button size="sm" onClick={runDiagnosis} className="bg-purple-600 hover:bg-purple-700"><Brain className="w-4 h-4 mr-1" />Analyze</Button>
                {diagnosisResults?.diagnoses && (
                  <div className="space-y-2 mt-2">
                    {diagnosisResults.diagnoses.map((d: any, i: number) => (
                      <div key={i} className={`p-2 rounded ${d.urgency === 'CRITICAL' ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800'}`}>
                        <div className="flex items-center gap-2"><span className="font-medium text-sm">{d.condition}</span><Badge variant="outline">{d.probability}%</Badge><Badge className={d.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}>{d.urgency}</Badge></div>
                        <p className="text-xs text-slate-400 mt-1">{d.reasoning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Treatment Firewall */}
            <Card className="bg-slate-900 border-orange-500/30">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-orange-400" />Treatment Firewall</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input className="bg-slate-800 border-slate-700" placeholder="Planned meds (e.g., Morphine, CT contrast)" value={plannedMeds} onChange={e => setPlannedMeds(e.target.value)} />
                <Button size="sm" onClick={runFirewall} className="bg-orange-600 hover:bg-orange-700"><Shield className="w-4 h-4 mr-1" />Check</Button>
                {firewallResults && (
                  <div className={`p-3 rounded text-center ${firewallResults.safeToProceed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className={`text-lg font-bold ${firewallResults.safeToProceed ? 'text-green-400' : 'text-red-400'}`}>{firewallResults.safeToProceed ? '✅ SAFE TO PROCEED' : '⛔ CONFLICTS DETECTED'}</div>
                  </div>
                )}
                {firewallResults?.conflicts?.map((c: any, i: number) => (
                  <div key={i} className={`p-2 rounded text-sm ${(c.severity === 'BLACK' || c.severity === 'RED') ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                    <div className="flex items-center gap-1 mb-1"><Badge variant="destructive" className="text-[10px]">{c.severity}</Badge><Badge variant="outline" className="text-[10px]">{c.type}</Badge></div>
                    <p className="text-slate-300">{c.description}</p>
                    <p className="text-green-400 text-xs mt-1">Alternative: {c.alternative}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Surgery Checklist */}
            <Card className="bg-slate-900 border-blue-500/30">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Scissors className="w-4 h-4 text-blue-400" />Pre-Op Checklist</CardTitle></CardHeader>
              <CardContent>
                <Button size="sm" onClick={runChecklist} className="bg-blue-600 hover:bg-blue-700"><Scissors className="w-4 h-4 mr-1" />Generate</Button>
                {checklistResults?.checklist && (
                  <div className="mt-3 space-y-3">
                    <div className="text-center"><div className="text-xl font-bold">{checklistResults.readinessScore}%</div><div className="text-xs text-slate-500">Readiness</div></div>
                    {checklistResults.checklist.map((cat: any, i: number) => (
                      <div key={i}><h4 className="font-medium text-xs text-slate-400 mb-1">{cat.category}</h4>
                        {cat.items.slice(0, 3).map((item: any, j: number) => (
                          <div key={j} className={`text-xs p-1.5 rounded mb-1 ${item.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-300' : item.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                            {item.priority === 'CRITICAL' && '🔴 '}{item.text.slice(0, 100)}{item.text.length > 100 ? '...' : ''}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medication Adherence */}
            {p.medicationAdherence?.length > 0 && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-400" />Medication Adherence</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {p.medicationAdherence.map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-24 truncate">{a.medicationName}</span>
                        <Progress value={a.overallScore} className="h-2 flex-1" />
                        <Badge className={`text-[10px] ${a.overallScore >= 90 ? 'bg-green-500/20 text-green-400' : a.overallScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{a.overallScore}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Radiation Exposure */}
            {p.radiationExposures?.length > 0 && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Radiation className="w-4 h-4 text-yellow-400" />Radiation: {p.radiationExposures.reduce((s: number, r: any) => s + r.doseMSv, 0).toFixed(1)} mSv</CardTitle></CardHeader>
                <CardContent><div className="space-y-1">{p.radiationExposures.map((r: any, i: number) => (
                  <div key={i} className="text-xs text-slate-400">{r.source} • {r.bodyRegion} • {r.doseMSv}mSv • {r.studyDate}</div>
                ))}</div></CardContent>
              </Card>
            )}

            {/* Occupational */}
            {p.occupationalExposures?.length > 0 && (
              <Card className="bg-slate-900 border-amber-500/20">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><HardHat className="w-4 h-4 text-amber-400" />Occupational Exposures</CardTitle></CardHeader>
                <CardContent><div className="space-y-1">{p.occupationalExposures.map((o: any, i: number) => (
                  <div key={i} className="p-2 bg-amber-500/10 rounded"><Badge className="bg-amber-500/20 text-amber-400 text-[10px]">{o.hazardType}</Badge><div className="text-sm">{o.workplace}: {o.specificAgent || 'Unknown agent'}</div></div>
                ))}</div></CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, count, id, expanded, toggle, children }: any) {
  const isExpanded = expanded === id;
  return (
    <div>
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
        <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-slate-400" /><span className="font-medium text-sm">{title}</span><Badge variant="outline" className="text-[10px]">{count}</Badge></div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && <div className="mt-1 space-y-1.5">{children}</div>}
    </div>
  );
}
