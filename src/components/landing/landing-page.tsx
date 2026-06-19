'use client';
import { useAppStore } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield, Heart, Brain, QrCode, Fingerprint, Globe, Clock, AlertTriangle, Mic, Users, Activity, Zap,
  ScanLine, Volume2, Lock, Eye, FileCheck, Stethoscope, Ambulance, Building2, Server,
  ChevronRight, UserCheck, ClipboardCheck, ShieldCheck, Timer, Link2, Scale
} from 'lucide-react';

export function LandingPage() {
  const { setCurrentPage, setAuthMode } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">MemoryVault</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#scenarios" className="hover:text-white transition-colors">Scenarios</a>
            <a href="#providers" className="hover:text-white transition-colors">For Providers</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setAuthMode('login'); setCurrentPage('auth'); }}>Sign In</Button>
            <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" onClick={() => { setAuthMode('register'); setCurrentPage('auth'); }}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            <AlertTriangle className="w-4 h-4" /> Every 60 seconds, a patient arrives unconscious at an ER
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            When you <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">can&apos;t speak</span>,<br />
            your vault does.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Digital Human Memory Vault gives hospitals instant access to your critical medical history during emergencies — in 5 seconds, not 45 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-lg px-8" onClick={() => { setAuthMode('register'); setCurrentPage('auth'); }}>
              Create Your Vault
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-lg px-8" onClick={() => setCurrentPage('demo')}>
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { label: 'Lives Saved/yr (est.)', value: '15,000+', icon: Heart },
              { label: 'Time to Critical Info', value: '5 sec', icon: Clock },
              { label: 'Problems Solved', value: '23', icon: AlertTriangle },
              { label: 'Unique Features', value: '99', icon: Zap },
            ].map((s, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6 text-center">
                  <s.icon className="w-6 h-6 mx-auto mb-2 text-red-400" />
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-slate-400">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">99 Features. 1 Platform.</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">The most comprehensive emergency medical intelligence system ever built.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Fingerprint, title: 'Multi-Modal ID', desc: 'QR, Facial Recognition, Fingerprint, Voice, NFC, Badge — unlock in 5 seconds', color: 'from-blue-500 to-cyan-500' },
              { icon: Brain, title: 'AI Diagnosis Engine', desc: 'Differential diagnosis, treatment firewall, drug conflict prevention, risk prediction', color: 'from-purple-500 to-pink-500' },
              { icon: Mic, title: 'Voice of the Patient', desc: 'Pre-recorded messages that play when you can\'t speak — your voice, your wishes', color: 'from-red-500 to-orange-500' },
              { icon: QrCode, title: 'Emergency Access', desc: 'Tiered access, break-glass override, auto-expiry, blockchain audit trail', color: 'from-green-500 to-emerald-500' },
              { icon: Globe, title: 'Multi-Language', desc: 'Medical-grade translation, cultural directives, religious requirements', color: 'from-yellow-500 to-amber-500' },
              { icon: Users, title: 'Family War Room', desc: 'Real-time updates, consent coordination, caregiver access passes', color: 'from-indigo-500 to-violet-500' },
              { icon: Activity, title: 'Smart Devices', desc: 'CGM, pacemaker, inhaler integration — real-time health intelligence', color: 'from-teal-500 to-cyan-500' },
              { icon: Shield, title: 'Genetic Safety', desc: 'Pharmacogenomics, malignant hyperthermia flags, anesthesia alerts', color: 'from-rose-500 to-pink-500' },
              { icon: Heart, title: 'Organ Match Engine', desc: 'Auto-match donors, viability countdown, transplant coordination', color: 'from-red-600 to-rose-600' },
            ].map((f, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
              <Zap className="w-3.5 h-3.5" /> Simple &amp; Life-Saving
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Four steps from setup to life-saving emergency access. No complex integrations, no IT overhead.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: UserCheck,
                title: 'Create Your Vault',
                desc: 'Patient enters medical history, allergies, medications, conditions — everything a first responder needs to know.',
                color: 'from-emerald-500 to-green-500',
                ring: 'bg-emerald-500/10 border-emerald-500/20',
              },
              {
                step: '02',
                icon: QrCode,
                title: 'Get Your QR',
                desc: 'Receive a unique QR code for your medical bracelet, wallet card, or phone lock screen. Always with you.',
                color: 'from-blue-500 to-cyan-500',
                ring: 'bg-blue-500/10 border-blue-500/20',
              },
              {
                step: '03',
                icon: ScanLine,
                title: 'Emergency Scan',
                desc: 'First responder scans your QR code in under 5 seconds. No app download, no login, no barriers.',
                color: 'from-amber-500 to-orange-500',
                ring: 'bg-amber-500/10 border-amber-500/20',
              },
              {
                step: '04',
                icon: Volume2,
                title: 'Life-Saving Data',
                desc: 'Critical info, AI analysis, drug safety checks, and family alerts activate instantly. Your voice speaks when you can\'t.',
                color: 'from-red-500 to-rose-500',
                ring: 'bg-red-500/10 border-red-500/20',
              },
            ].map((s, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-slate-700 to-slate-600" />
                )}
                <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all h-full">
                  <CardContent className="pt-6 text-center">
                    <div className={`w-20 h-20 rounded-full ${s.ring} border-2 flex items-center justify-center mx-auto mb-4 relative`}>
                      <s.icon className="w-8 h-8 text-white" />
                      <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                        {s.step}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-lg">{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Emergency Scenarios */}
      <section id="scenarios" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <AlertTriangle className="w-3.5 h-3.5" /> Real Stories, Real Stakes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Emergency Scenarios</h2>
            <p className="text-slate-400 max-w-xl mx-auto">These aren&apos;t hypothetical. They happen every day in every ER around the world.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* The Tourist */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-all group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">The Tourist</div>
                <h3 className="text-lg font-bold text-white mb-3">Maria, 34 — Spanish Tourist</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Arrives unconscious at a rural ER after a car accident. No ID, no medical history, no family present. She can&apos;t speak English.
                </p>
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">Vault reveals in 5 seconds:</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> Severe NSAID allergy — ibuprofen could be fatal</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> Type 1 Diabetes — insulin-dependent, DKA risk</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> Jehovah&apos;s Witness — no blood products</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2713;</span> <span className="text-emerald-300">Auto-translated to Spanish for consent</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* The Veteran */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/30 transition-all group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">The Veteran</div>
                <h3 className="text-lg font-bold text-white mb-3">James, 78 — Army Veteran</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Found unresponsive at home by a neighbor. No family reachable. Lives alone with complex medical history.
                </p>
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">Vault prevents fatal errors:</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> DNR Order — comfort care only, no intubation</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> Pacemaker — MRI contraindicated</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> On blood thinners — bleeding risk extreme</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2713;</span> <span className="text-emerald-300">Drug interaction engine blocks 3 conflicts</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* The Foster Child */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-500/30 transition-all group">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-1">The Foster Child</div>
                <h3 className="text-lg font-bold text-white mb-3">Aidan, 6 — Foster Child</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Having seizures at school. No parents present. Foster caseworker hasn&apos;t arrived. ER must act now.
                </p>
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-300">Vault warns immediately:</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x26A0;</span> <strong className="text-red-300">DO NOT give carbamazepine</strong> — fatal in Dravet Syndrome</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> Dravet Syndrome confirmed — specific protocol required</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">&#x2022;</span> Emergency seizure protocol on file</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">&#x2713;</span> <span className="text-emerald-300">Caseworker auto-notified, consent chain activated</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Hospitals & First Responders */}
      <section id="providers" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
              <Stethoscope className="w-3.5 h-3.5" /> Built With Clinicians
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Hospitals &amp; First Responders</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Designed by ER doctors, paramedics, and hospital administrators for the moments that matter most.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* ER Doctors */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">ER Doctors</h3>
                <ul className="space-y-3">
                  {[
                    { text: 'Instant access to critical data — allergies, conditions, DNR', icon: Zap },
                    { text: 'AI-powered treatment checking & drug interaction prevention', icon: Brain },
                    { text: 'Pre-hospital notification before patient arrives', icon: Clock },
                    { text: 'Risk scoring for triage prioritization', icon: Activity },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <item.icon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Paramedics */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                  <Ambulance className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Paramedics</h3>
                <ul className="space-y-3">
                  {[
                    { text: 'Field access via QR scan — no app download needed', icon: ScanLine },
                    { text: 'Pre-hospital notification to receiving hospital', icon: Building2 },
                    { text: 'Voice messages play patient\'s own wishes', icon: Volume2 },
                    { text: 'Drug safety checks in the ambulance', icon: ShieldCheck },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <item.icon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Hospitals */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Hospitals</h3>
                <ul className="space-y-3">
                  {[
                    { text: 'Reduced liability with complete audit trail', icon: FileCheck },
                    { text: 'Better patient outcomes with informed decisions', icon: Heart },
                    { text: 'HIPAA compliance with tiered access controls', icon: Shield },
                    { text: 'Lower readmission rates with discharge safety net', icon: ClipboardCheck },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <item.icon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section id="security" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
              <Lock className="w-3.5 h-3.5" /> Bank-Grade Security
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Security &amp; Privacy</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Your medical data is more sensitive than financial data. We treat it that way.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                desc: 'AES-256 encryption at rest and in transit. Your data is unreadable to anyone without authorized access — including us.',
                color: 'text-green-400',
                bg: 'bg-green-500/10',
              },
              {
                icon: Eye,
                title: 'Tiered Access Controls',
                desc: '5 access tiers from basic demographics to end-of-life directives. Each tier requires escalating authorization and audit verification.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                icon: Timer,
                title: 'Auto-Expiring Emergency Access',
                desc: 'Emergency access auto-expires after 24 hours. No standing permissions, no forgotten open sessions, no permanent access grants.',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
              {
                icon: Link2,
                title: 'Blockchain-Style Audit Trail',
                desc: 'Every access, view, and data point is logged with cryptographic hashing. Tamper-proof, legally admissible, fully traceable.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                icon: Scale,
                title: 'HIPAA & GDPR Compliant',
                desc: 'Built to meet and exceed HIPAA Privacy Rule and GDPR requirements. Regular third-party security audits and penetration testing.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
              },
              {
                icon: Server,
                title: 'Zero-Knowledge Architecture',
                desc: 'We cannot read your vault data. Patient-controlled encryption keys ensure true data ownership and privacy sovereignty.',
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
              },
            ].map((s, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to protect what matters most?</h2>
          <p className="text-slate-400 mb-8 text-lg">Create your vault in under 5 minutes. It could save your life.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-lg px-8" onClick={() => { setAuthMode('register'); setCurrentPage('auth'); }}>
              Create Your Free Vault
            </Button>
            <Button size="lg" variant="outline" className="border-slate-700 text-lg px-8" onClick={() => { setAuthMode('login'); setCurrentPage('auth'); }}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Test Accounts */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Try It Now — Demo Accounts</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { email: 'maria@test.com', name: 'Maria Garcia', desc: 'Spanish tourist, T1 diabetic, allergic to NSAIDs' },
              { email: 'james@test.com', name: 'James Wilson', desc: '78yo veteran, pacemaker, DNR, on blood thinners' },
              { email: 'dr.chen@test.com', name: 'Dr. Sarah Chen', desc: 'ER doctor at City General Hospital' },
            ].map((a, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 cursor-pointer hover:border-red-500/50 transition-all"
                onClick={() => { setAuthMode('login'); setCurrentPage('auth'); }}>
                <CardContent className="pt-6 text-left">
                  <div className="font-medium text-white">{a.name}</div>
                  <div className="text-sm text-slate-400">{a.email}</div>
                  <div className="text-xs text-slate-500 mt-1">{a.desc}</div>
                  <div className="text-xs text-red-400 mt-2">Password: password123</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">MemoryVault</span>
          </div>
          <p className="text-slate-500 text-sm">Because silence should never be fatal.</p>
          <div className="flex gap-6 text-xs text-slate-500">
            <span>99 features</span>
            <span>23 problems solved</span>
            <span>1 platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
