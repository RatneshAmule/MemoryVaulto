'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, Heart, Brain, Mic, Phone, Clock, Activity, Zap, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

const DEMO_STEPS = [
  { time: 0, title: '🚨 EMERGENCY ALERT', desc: 'Car accident victim, unconscious, no ID. Paramedics arrive on scene.', color: 'text-red-400', icon: AlertTriangle },
  { time: 5, title: '📱 QR BRACELET SCANNED', desc: 'Paramedic scans patient\'s MemoryVault QR bracelet. Vault access initiated...', color: 'text-cyan-400', icon: Shield },
  { time: 10, title: '🔓 VAULT UNLOCKED — 5 SECONDS', desc: 'Emergency access granted. Patient: Maria Garcia, 34, Spanish tourist. Blood: A-negative.', color: 'text-green-400', icon: Shield },
  { time: 15, title: '🔴 CRITICAL RED FLAGS', desc: 'ALLERGY: NSAIDs (SEVERE — Anaphylaxis) • ALLERGY: Penicillin • CONDITION: Type 1 Diabetes • MEDICATION: Insulin Glargine, Lispro, Metformin', color: 'text-red-500', icon: AlertTriangle },
  { time: 22, title: '🧬 PHARMACOGENOMIC ALERT', desc: 'CYP2D6 Poor Metabolizer detected. Codeine will be INEFFECTIVE. Tramadol will be INEFFECTIVE. Use Hydromorphone instead.', color: 'text-purple-400', icon: Brain },
  { time: 28, title: '🤖 AI DIFFERENTIAL DIAGNOSIS', desc: 'Based on T1 Diabetes + unconscious + possible head trauma: 72% Hypoglycemia, 18% Diabetic Ketoacidosis, 7% Head Injury, 3% Other', color: 'text-blue-400', icon: Brain },
  { time: 35, title: '💊 TREATMENT FIREWALL CHECK', desc: 'Checking planned medications against vault... MORPHINE: ⛔ BLOCKED (NSAID cross-reactivity concern). ACETAMINOPHEN: ✅ SAFE. DEXTROSE: ✅ CRITICAL (hypoglycemia likely)', color: 'text-orange-400', icon: Zap },
  { time: 42, title: '🏥 HOSPITAL PRE-NOTIFIED', desc: 'City General Hospital ER receiving vault data. Team preparing: Glucose protocol initiated. Spanish interpreter requested.', color: 'text-emerald-400', icon: Activity },
  { time: 48, title: '📞 EMERGENCY CONTACT CASCADE', desc: 'Calling Carlos Garcia (Husband, Barcelona)... ✅ REACHED. Calling Elena Garcia (Mother)... ⏳ Ringing... ✅ REACHED.', color: 'text-amber-400', icon: Phone },
  { time: 55, title: '🎙️ VOICE OF THE PATIENT', desc: '"Hello, my name is Maria Garcia. I am 34 years old, from Barcelona. I have Type 1 Diabetes and I am severely allergic to NSAIDs and Penicillin. I am a Jehovah\'s Witness and I do not accept blood transfusions."', color: 'text-red-400', icon: Mic },
  { time: 65, title: '✝️ CULTURAL DIRECTIVE FLAGGED', desc: 'RELIGIOUS DIRECTIVE: Jehovah\'s Witness — NO BLOOD PRODUCTS. Override NOT allowed. Blood conservation strategies required.', color: 'text-rose-400', icon: Shield },
  { time: 72, title: '📋 SURGERY CHECKLIST GENERATED', desc: 'Patient-specific pre-op checklist: ☐ Verify NSAID allergy (all preparations) ☐ Use Hydromorphone (not Codeine) ☐ Latex-free setup ☐ No blood products ☐ Spanish interpreter ☐ Dextrose drip ready ☐ Monitor glucose hourly', color: 'text-indigo-400', icon: Shield },
  { time: 80, title: '👨‍👩‍👦 FAMILY WAR ROOM ACTIVATED', desc: 'Real-time updates: Patient STABLE, in CT scan, Room 3. Carlos can see live status. Consent: Carlos authorizes treatment.', color: 'text-teal-400', icon: Phone },
  { time: 90, title: '✅ TREATMENT APPROVED & DELIVERED', desc: 'AI Firewall: All treatments verified safe. Dextrose administered — glucose rising. Pain managed with Hydromorphone. No blood products needed. Family informed and updated.', color: 'text-green-400', icon: Heart },
  { time: 100, title: '🔒 ACCESS AUTO-EXPIRES IN 24H', desc: 'Emergency vault access will auto-expire. Full audit trail recorded on blockchain. Patient will be notified when conscious. Post-discharge continuity plan activated.', color: 'text-slate-400', icon: Shield },
];

export function DemoModePage() {
  const { setCurrentPage } = useAppStore();
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        const newStep = DEMO_STEPS.findIndex((s, i) => {
          const nextTime = DEMO_STEPS[i + 1]?.time ?? Infinity;
          return next >= s.time && next < nextTime;
        });
        if (newStep !== -1) setStep(newStep);
        if (next > 110) { setPlaying(false); return prev; }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  const reset = () => { setPlaying(false); setStep(0); setElapsed(0); };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage('landing')}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Live Emergency Demo</h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setPlaying(!playing)} className={playing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'}>
              {playing ? <><Pause className="w-4 h-4 mr-1" />Pause</> : <><Play className="w-4 h-4 mr-1" />Play</>}
            </Button>
            <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>T+0s</span><span>Emergency Timeline</span><span>T+100s</span>
          </div>
          <Progress value={(elapsed / 110) * 100} className="h-2" />
        </div>

        {/* Current Step Display */}
        {DEMO_STEPS.slice(0, step + 1).reverse().map((s, i) => (
          <motion.div key={`${step}-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`mb-3 ${i === 0 ? 'bg-slate-900 border-2 border-red-500/50' : 'bg-slate-900/50 border-slate-800'} ${i > 4 ? 'opacity-40' : i > 2 ? 'opacity-60' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-red-500/20' : 'bg-slate-800'}`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">T+{s.time}s</span>
                      <h3 className={`font-bold ${i === 0 ? s.color : 'text-slate-300'}`}>{s.title}</h3>
                    </div>
                    <p className={`text-sm ${i === 0 ? 'text-slate-200' : 'text-slate-400'}`}>{s.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {!playing && step === 0 && (
          <Card className="bg-slate-900 border-red-500/30">
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Emergency Simulation</h3>
              <p className="text-slate-400 mb-4">Watch the MemoryVault save a life in real-time. Press Play to begin the scenario.</p>
              <Button size="lg" className="bg-red-600 hover:bg-red-700" onClick={() => setPlaying(true)}>
                <Play className="w-5 h-5 mr-2" />Start Demo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
