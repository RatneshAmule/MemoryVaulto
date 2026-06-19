'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, AlertTriangle, Activity, Heart, Users, Zap, Brain, Droplets, Globe, Radiation, Clock, LogOut, LayoutDashboard, Radio, Play, BarChart3, Dna, ScanLine, QrCode, Unlock, Phone, Siren, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function HospitalDashboard() {
  const { currentUser, logout, setCurrentPage, setSelectedPatientId, setCurrentPatient } = useAppStore();
  const [patients, setPatients] = useState<any[]>([]);
  const [accesses, setAccesses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState('');
  const [outbreaks, setOutbreaks] = useState<any[]>([]);
  const [organMatches, setOrganMatches] = useState<any>({});
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Emergency Scan state
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Emergency Lookup state
  const [lookupId, setLookupId] = useState('');
  const [lookupName, setLookupName] = useState('');
  const [breakGlassActive, setBreakGlassActive] = useState(false);
  const [breakGlassLoading, setBreakGlassLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch('/api/hospital/dashboard');
        const data = await res.json();
        if (res.ok) { setPatients(data.patients || []); setAccesses(data.recentAccesses || []); setStats(data.stats || {}); }
        const obRes = await fetch('/api/hospital/outbreaks');
        const obData = await obRes.json();
        if (obRes.ok) setOutbreaks(obData.outbreaks || []);
        const omRes = await fetch('/api/hospital/organ-matches');
        const omData = await omRes.json();
        if (omRes.ok) setOrganMatches(omData);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    loadDashboard();
  }, [reloadKey]);

  const handlePatientSelect = async (patientId: string, method: string = 'search') => {
    setSelectedPatientId(patientId);
    try {
      // Create access log first
      if (currentUser?.id) {
        const isBreakGlass = method === 'break-glass';
        await fetch(`/api/emergency/${patientId}/access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessorId: currentUser.id,
            accessType: isBreakGlass ? 'break-glass' : 'emergency',
            accessMethod: method,
            reason: isBreakGlass ? 'Break-glass emergency override from hospital dashboard' : 'Emergency vault access from hospital dashboard',
            dataViewed: ['profile', 'allergies', 'medications', 'conditions'],
          }),
        });
      }
      const res = await fetch(`/api/patients/${patientId}`);
      const data = await res.json();
      if (res.ok) { setCurrentPatient(data.patient); setCurrentPage('emergency'); }
      toast.success('Emergency access logged. This access will auto-expire in 24 hours.');
    } catch { toast.error('Failed to load patient'); }
  };

  // Simulate QR scan
  const simulateQRScan = () => {
    if (patients.length === 0) return;
    setScanning(true);
    setScanComplete(false);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setScanComplete(true);
      // Pick a random patient
      const randomPatient = patients[Math.floor(Math.random() * patients.length)];
      setTimeout(() => {
        setScanning(false);
        setScanComplete(false);
        setScanProgress(0);
        handlePatientSelect(randomPatient.id, 'qr');
      }, 1000);
    }, 2500);
  };

  // Emergency lookup
  const handleEmergencyLookup = async () => {
    if (!lookupId && !lookupName) {
      toast.error('Enter a patient ID or name to look up');
      return;
    }
    setLookupLoading(true);
    try {
      // Search by ID first, then by name
      let foundPatient = null;

      if (lookupId) {
        // Try as name search first, could be an ID-like name
        const res = await fetch(`/api/emergency/search?name=${encodeURIComponent(lookupId)}`);
        const data = await res.json();
        if (data.patients?.length > 0) {
          foundPatient = data.patients[0];
        } else {
          // Try direct patient fetch by ID
          try {
            const directRes = await fetch(`/api/patients/${encodeURIComponent(lookupId)}`);
            const directData = await directRes.json();
            if (directRes.ok && directData.patient) foundPatient = directData.patient;
          } catch {}
        }
      }

      if (!foundPatient && lookupName) {
        const res = await fetch(`/api/emergency/search?name=${encodeURIComponent(lookupName)}`);
        const data = await res.json();
        if (data.patients?.length > 0) foundPatient = data.patients[0];
      }

      if (foundPatient) {
        const accessType = breakGlassActive ? 'break-glass' : 'emergency';
        await handlePatientSelect(foundPatient.id, breakGlassActive ? 'break-glass' : 'search');
        if (breakGlassActive) {
          toast.success('Break-glass emergency override applied. Full access granted.');
        }
      } else {
        toast.error('No patient found with that ID or name');
      }
    } catch {
      toast.error('Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  // Break glass
  const handleBreakGlass = async () => {
    setBreakGlassLoading(true);
    // Simulate a brief delay for security override
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBreakGlassActive(true);
    setBreakGlassLoading(false);
    toast.success('🔒 Break-glass override activated. Full emergency access granted. All actions are being logged.', { duration: 5000 });
  };

  const filteredPatients = patients.filter(p =>
    !search || p.user?.name?.toLowerCase().includes(search.toLowerCase()) || p.bloodType?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">MemoryVault</span>
          <Badge className="bg-emerald-500/20 text-emerald-400">{currentUser?.role}</Badge>
          {currentUser?.hospital && <span className="text-sm text-slate-400">{currentUser.hospital}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('demo')}><Play className="w-4 h-4 mr-1" />Demo</Button>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-slate-900 border border-slate-800 mb-4 flex-wrap">
            <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="patients"><Users className="w-4 h-4 mr-1" />Patients</TabsTrigger>
            <TabsTrigger value="emergency-scan"><QrCode className="w-4 h-4 mr-1" />Emergency Scan</TabsTrigger>
            <TabsTrigger value="outbreaks"><Radio className="w-4 h-4 mr-1" />Outbreaks</TabsTrigger>
            <TabsTrigger value="organs"><Heart className="w-4 h-4 mr-1" />Organ Match</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Patients', value: stats.totalPatients || 0, icon: Users, color: 'text-blue-400' },
                { label: 'Active Emergencies', value: stats.activeEmergencies || 0, icon: AlertTriangle, color: 'text-red-400' },
                { label: 'Total Accesses', value: stats.totalAccesses || 0, icon: Activity, color: 'text-green-400' },
                { label: 'Organ Donors', value: stats.organDonors || 0, icon: Heart, color: 'text-pink-400' },
              ].map((s, i) => (
                <Card key={i} className="bg-slate-900 border-slate-800"><CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-1"><s.icon className={`w-4 h-4 ${s.color}`} /><span className="text-xs text-slate-500">{s.label}</span></div>
                  <div className="text-2xl font-bold">{s.value}</div>
                </CardContent></Card>
              ))}
            </div>

            {/* Recent Emergency Accesses */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-base">Recent Emergency Accesses</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {accesses.length === 0 ? <p className="text-slate-500 text-sm">No emergency accesses recorded</p> :
                    accesses.map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
                        <Badge variant="destructive">{a.accessType}</Badge>
                        <span className="text-sm">By: {a.accessor?.name}</span>
                        <span className="text-sm text-slate-400">Patient: {a.patient?.user?.name}</span>
                        <span className="text-xs text-slate-500 ml-auto">{new Date(a.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients">
            <div className="mb-4">
              <Input className="bg-slate-900 border-slate-700" placeholder="Search by name or blood type..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPatients.map((p: any) => (
                <Card key={p.id} className="bg-slate-900 border-slate-800 hover:border-red-500/30 cursor-pointer transition-all" onClick={() => handlePatientSelect(p.id)}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-red-400" /></div>
                      <div><div className="font-medium">{p.user?.name}</div><div className="text-xs text-slate-400">{p.bloodType}{p.rhFactor || ''} • {p.gender} • {p.primaryLanguage}</div></div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.dnr && <Badge variant="destructive" className="text-[10px]">DNR</Badge>}
                      {p.organDonor && <Badge className="text-[10px] bg-green-500/20 text-green-400">Donor</Badge>}
                      {p.pregnancyStatus === 'confirmed' && <Badge className="text-[10px] bg-pink-500/20 text-pink-400">Pregnant</Badge>}
                      {p.veteranStatus && <Badge className="text-[10px] bg-blue-500/20 text-blue-400">Veteran</Badge>}
                      {p.refugeeStatus && <Badge className="text-[10px] bg-amber-500/20 text-amber-400">Refugee</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.allergies?.slice(0, 3).map((a: any, j: number) => (
                        <Badge key={j} variant="outline" className={`text-[10px] ${a.severity === 'severe' ? 'border-red-500/50 text-red-400' : 'border-slate-600'}`}>{a.name}</Badge>
                      ))}
                      {p.conditions?.slice(0, 2).map((c: any, j: number) => (
                        <Badge key={j} variant="outline" className="text-[10px] border-blue-500/50 text-blue-400">{c.name}</Badge>
                      ))}
                    </div>
                    {(p.voiceMessages?.length > 0) && <div className="mt-2 flex items-center gap-1 text-xs text-red-400"><Zap className="w-3 h-3" />Voice Messages Available</div>}
                    {(p.geneticFlags?.length > 0) && <div className="mt-1 flex items-center gap-1 text-xs text-purple-400"><Brain className="w-3 h-3" />{p.geneticFlags.length} Genetic Flags</div>}
                    {(p.pharmacogenomics?.length > 0) && <div className="mt-1 flex items-center gap-1 text-xs text-cyan-400"><Dna className="w-3 h-3" />{p.pharmacogenomics.length} Pharmacogenomic Profiles</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* NEW: Emergency Scan Tab */}
          <TabsContent value="emergency-scan">
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Scan Simulation */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-slate-900 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ScanLine className="w-5 h-5 text-red-400" />
                      QR Bracelet Scanner
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                      {!scanning && !scanComplete ? (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full text-center py-8"
                        >
                          <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 transition-all" onClick={simulateQRScan}>
                            <QrCode className="w-12 h-12 text-red-400" />
                          </div>
                          <Button
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6"
                            onClick={simulateQRScan}
                          >
                            <ScanLine className="w-6 h-6 mr-2" />
                            SCAN QR BRACELET
                          </Button>
                          <p className="text-sm text-slate-500 mt-4">Click to simulate scanning a patient&apos;s QR code bracelet</p>
                        </motion.div>
                      ) : scanning && !scanComplete ? (
                        <motion.div
                          key="scanning"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="w-full text-center py-8"
                        >
                          {/* Scanning animation */}
                          <div className="relative w-48 h-48 mx-auto mb-6">
                            <div className="absolute inset-0 border-2 border-red-500/50 rounded-xl" />
                            <motion.div
                              className="absolute left-0 right-0 h-0.5 bg-red-500"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-400" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-400" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-400" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-400" />
                            <QrCode className="w-16 h-16 text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          <div className="w-64 mx-auto">
                            <div className="flex justify-between text-sm text-slate-400 mb-1">
                              <span>Scanning...</span>
                              <span>{Math.min(Math.round(scanProgress), 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <motion.div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${Math.min(scanProgress, 100)}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-red-400 mt-4 animate-pulse">Hold steady... reading QR code</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="complete"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="w-full text-center py-8"
                        >
                          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                          <p className="text-lg font-bold text-green-400">QR Code Read Successfully!</p>
                          <p className="text-sm text-slate-400 mt-2">Loading patient emergency vault...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Recent scan info */}
                    <div className="w-full mt-4 p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Siren className="w-4 h-4" />
                        <span>All QR scans are logged with timestamp, operator ID, and access tier</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Emergency Lookup */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-slate-900 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Search className="w-5 h-5 text-amber-400" />
                      Emergency Lookup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Patient ID</label>
                      <Input
                        className="bg-slate-800 border-slate-700"
                        placeholder="Enter patient ID (e.g., patient CUID)"
                        value={lookupId}
                        onChange={e => setLookupId(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Patient Name</label>
                      <Input
                        className="bg-slate-800 border-slate-700"
                        placeholder="Enter patient name"
                        value={lookupName}
                        onChange={e => setLookupName(e.target.value)}
                      />
                    </div>

                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={handleEmergencyLookup}
                      disabled={lookupLoading}
                    >
                      {lookupLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                      Emergency Lookup
                    </Button>

                    {/* Break Glass Section */}
                    <div className="border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Unlock className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Emergency Override</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        If normal authentication is unavailable, use break-glass to bypass access controls.
                        <strong className="text-red-400"> All actions are audit-logged.</strong>
                      </p>

                      {!breakGlassActive ? (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleBreakGlass}
                          disabled={breakGlassLoading}
                        >
                          {breakGlassLoading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Authorizing...</>
                          ) : (
                            <><Unlock className="w-4 h-4 mr-2" />BREAK GLASS — Emergency Override</>
                          )}
                        </Button>
                      ) : (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                              <Unlock className="w-4 h-4 text-red-400" />
                            </motion.div>
                            <span className="text-sm font-bold text-red-400">Break-Glass Active</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Full emergency access granted. Use the lookup above with override enabled.</p>
                        </div>
                      )}
                    </div>

                    {/* Access audit log notice */}
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-400">Access Audit Trail</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>• All emergency lookups are logged with operator credentials</p>
                        <p>• Break-glass overrides trigger immediate audit review</p>
                        <p>• Access auto-expires after 24 hours</p>
                        <p>• Patient and family are notified of all emergency access</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick patient list for emergency access */}
            <div className="mt-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Siren className="w-5 h-5 text-red-400" />
                    Quick Emergency Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {patients.slice(0, 6).map((p: any) => (
                      <div
                        key={p.id}
                        className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750 hover:border-red-500/30 border border-slate-700 transition-all"
                        onClick={() => handlePatientSelect(p.id, 'search')}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{p.user?.name}</span>
                          <Badge className="bg-red-500/20 text-red-400 text-[10px]">{p.bloodType}{p.rhFactor || ''}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {p.dnr && <Badge variant="destructive" className="text-[10px]">DNR</Badge>}
                          {p.allergies?.filter((a: any) => a.severity === 'severe').slice(0, 2).map((a: any, j: number) => (
                            <Badge key={j} variant="outline" className="text-[10px] border-red-500/50 text-red-400">{a.name}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="outbreaks">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Radio className="w-5 h-5 text-amber-400" />Outbreak Radar</CardTitle></CardHeader>
              <CardContent>
                {outbreaks.length === 0 ? (
                  <div className="text-center py-8"><Radio className="w-10 h-10 text-green-400 mx-auto mb-2" /><p className="text-green-400 font-medium">No Active Outbreaks</p><p className="text-slate-500 text-sm">Community surveillance is monitoring</p></div>
                ) : (
                  <div className="space-y-3">{outbreaks.map((o: any, i: number) => (
                    <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1"><Badge variant="destructive">{o.type}</Badge><Badge variant="outline">{o.alertLevel}</Badge></div>
                      <p className="text-sm">{o.description}</p>
                      <div className="text-xs text-slate-500 mt-1">Cases: {o.caseCount} • ZIP: {o.zipCode} • {new Date(o.firstDetected).toLocaleDateString()}</div>
                    </div>
                  ))}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organs">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400" />Organ Match Engine</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-pink-400">{organMatches.availableDonors || 0}</div>
                  <div className="text-sm text-slate-400">Available Donors</div>
                </div>
                <div className="space-y-2">
                  {(organMatches.donors || []).map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                      <div><span className="font-medium">{d.name}</span><span className="text-slate-500 ml-2">{d.bloodType}</span></div>
                      <Button size="sm" variant="outline" className="text-pink-400 border-pink-500/30" onClick={async () => {
                        const res = await fetch('/api/hospital/organ-matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donorPatientId: d.id, organType: 'kidney' }) });
                        const data = await res.json();
                        if (res.ok) { toast.success('Match search initiated'); setReloadKey(k => k + 1); } else toast.error('Failed');
                      }}>Find Match</Button>
                    </div>
                  ))}
                </div>
                {(organMatches.matches || []).length > 0 && (
                  <div className="mt-4"><h4 className="font-medium mb-2">Active Matches</h4>
                    <div className="space-y-2">{(organMatches.matches || []).map((m: any, i: number) => (
                      <div key={i} className="p-2 bg-slate-800 rounded flex items-center justify-between">
                        <div><Badge className="bg-pink-500/20 text-pink-400">{m.organType}</Badge><span className="text-sm ml-2">Match: {m.tissueMatch}%</span></div>
                        <div className="text-xs text-slate-500">{m.status} • Viability: {m.viabilityMinutes}min</div>
                      </div>
                    ))}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
