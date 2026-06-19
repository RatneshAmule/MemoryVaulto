'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Play, RotateCcw, AlertTriangle,
  Shield, Heart, Activity, Clock, Users, Search, QrCode,
  CheckCircle2, XCircle, Baby, Globe, Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScenarioStep {
  narrative: string;
  type: 'narrative' | 'action' | 'result';
  highlight?: string;
  data?: Record<string, unknown>;
}

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  steps: ScenarioStep[];
}

const scenarios: Scenario[] = [
  {
    id: 'tourist',
    title: 'The Unconscious Tourist',
    subtitle: 'A woman collapses with no ID, no English — QR bracelet saves her life',
    icon: <Search className="w-5 h-5" />,
    color: 'text-red-400',
    steps: [
      { narrative: 'A 34-year-old woman collapses on a subway platform. No ID, no phone, no English. Bystanders call 911.', type: 'narrative' },
      { narrative: 'Paramedics arrive. They search the patient registry by partial name from a receipt in her pocket: "Rodriguez".', type: 'action', highlight: 'Search: Rodriguez' },
      { narrative: 'QR bracelet scanned — vault unlocking... Access granted via QR Code method. Emergency access logged.', type: 'action', highlight: 'QR Scan → Vault Unlocking' },
      { narrative: 'Critical data revealed: Blood Type A-, SEVERE Penicillin allergy (anaphylaxis risk), Type 1 Diabetic on Insulin Glargine.', type: 'result', data: { bloodType: 'A-', allergies: ['Penicillin (SEVERE)', 'NSAIDs (moderate)'], conditions: ['Type 1 Diabetes'], medications: ['Insulin Glargine', 'Metformin'] } },
      { narrative: 'ER doctor considers administering Ibuprofen for pain relief. Drug Safety Check immediately flags DANGER: NSAID allergy.', type: 'action', highlight: '⚠️ DRUG CHECK: Ibuprofen → DANGER' },
      { narrative: 'Alternative pain relief selected (Acetaminophen). Emergency contacts auto-notified: Carlos Rodriguez (Husband) notified in Barcelona.', type: 'action' },
      { narrative: '✓ Outcome: Correct treatment given. Allergy avoided. Family informed in 2 minutes. Full audit trail logged.', type: 'result' },
    ],
  },
  {
    id: 'elderly',
    title: 'The Elderly Man Alone',
    subtitle: 'James Wilson, 78, falls in bathroom — AI risk engine reveals critical profile',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-amber-400',
    steps: [
      { narrative: 'James Wilson, 78, falls in bathroom. Smart watch detects fall and alerts EMS.', type: 'narrative' },
      { narrative: 'Facial recognition at hospital identifies patient. Emergency vault access granted.', type: 'action', highlight: 'Facial Recognition → Identity Confirmed' },
      { narrative: 'AI Risk Score: 87 CRITICAL — Warfarin + A-Fib + Prior MI + Hypertension + Diabetes + Obesity. 7 risk factors identified.', type: 'result', data: { riskScore: 87, level: 'CRITICAL', factors: ['Warfarin (anticoagulant)', 'Atrial Fibrillation', 'Prior MI', 'Hypertension', 'Type 2 Diabetes', 'Obesity', 'Age 78'] } },
      { narrative: 'Auto-Triage triggered: STEMI Watch Protocol. Cardiac Protocol. Golden window: 60 minutes countdown started.', type: 'action', highlight: 'STEMI Protocol → Golden Hour Started' },
      { narrative: 'Comorbidity Risk Map reveals: Diabetes ↔ Hypertension ↔ A-Fib ↔ Obesity. All interconnected, compounding risk.', type: 'result', data: { map: 'Diabetes-Hypertension-AFib-Obesity cluster' } },
      { narrative: 'DNR Status: YES — Comfort Care Pathway activated. Resuscitation will NOT be performed per advance directive.', type: 'action', highlight: '⚠️ DNR ORDER ON FILE' },
      { narrative: 'Daughter Sarah notified. Vault access logged with full audit trail. Comfort measures initiated.', type: 'result' },
    ],
  },
  {
    id: 'foster-child',
    title: 'The Foster Child',
    subtitle: 'Aiden, 6, seizure at school — vault prevents fatal medication error',
    icon: <Baby className="w-5 h-5" />,
    color: 'text-purple-400',
    steps: [
      { narrative: 'Aiden, 6 years old, has a prolonged seizure at school. Foster home #4. No parents present.', type: 'narrative' },
      { narrative: 'QR code on school ID scanned. Emergency vault access granted. Patient identified immediately.', type: 'action', highlight: 'QR Scan → Aiden Brooks, Age 6' },
      { narrative: 'RED FLAGS: Dravet Syndrome — DO NOT give Carbamazepine or Phenytoin (fatal risk). Severe allergy flagged. Immunocompromised status active.', type: 'result', data: { flags: ['SEVERE ALLERGY: Carbamazepine', 'Dravet Syndrome — Sodium channel blockers contraindicated', 'Immunocompromised — Isolation required'] } },
      { narrative: 'Pediatric Auto-Dosing: Weight 22kg → Rescue medication dose calculated. Valproic Acid 250mg appropriate for weight.', type: 'action', highlight: 'Auto-Dose: 22kg → Calculated' },
      { narrative: 'Immunocompromised flag triggers isolation room assignment. Strict hand hygiene protocols activated.', type: 'action' },
      { narrative: 'Case worker Diana Martinez auto-notified. Foster family notified. Full consent proxy chain activated.', type: 'action' },
      { narrative: '✓ Outcome: Correct rescue meds given. Sodium channel blockers avoided. Child stabilized in isolation. All guardians notified.', type: 'result' },
    ],
  },
  {
    id: 'mass-casualty',
    title: 'Mass Casualty Event',
    subtitle: 'Building collapse — AI triage sorts 87 victims by severity using vault data',
    icon: <Users className="w-5 h-5" />,
    color: 'text-orange-400',
    steps: [
      { narrative: 'Building collapse. 87 victims. 3 hospitals receiving patients. Mass casualty protocol activated.', type: 'narrative' },
      { narrative: 'AI Triage sorts patients by severity using vault data. QR codes and biometrics rapidly identify victims.', type: 'action', highlight: 'AI Sorting: 87 patients → Priority Queue' },
      { narrative: 'Patient 1: Maria Rodriguez — CRITICAL. Blood A-, severe Penicillin allergy, Type 1 Diabetic. Sorted to front of queue.', type: 'result', data: { patient: 'Maria Rodriguez', priority: 'CRITICAL', bloodType: 'A-', flags: ['Penicillin allergy', 'Type 1 Diabetes'] } },
      { narrative: 'Blood bank matched from vault blood types: 12 O+, 8 A-, 5 B+ identified. Cross-match ready.', type: 'action' },
      { narrative: 'Each vault access logged for legal compliance. Full audit trail maintained for every emergency access.', type: 'action' },
      { narrative: '✓ Outcome: All 87 patients triaged. Critical patients treated first. Allergies avoided. Blood types matched. Full compliance maintained.', type: 'result' },
    ],
  },
  {
    id: 'refugee-mother',
    title: 'The Refugee Mother',
    subtitle: 'Amira, 29, 7 months pregnant — pregnancy protocols prevent fetal harm',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-emerald-400',
    steps: [
      { narrative: 'Amira, 29, 7 months pregnant, collapses at refugee camp clinic. No documents available in local language.', type: 'narrative' },
      { narrative: 'Fingerprint scan opens vault. Biometric access granted. Patient identified: Amira Hassan.', type: 'action', highlight: 'Biometric → Amira Hassan' },
      { narrative: 'Pregnancy Protocol triggered — Rh-negative blood type, previous C-section. Fetal monitoring initiated.', type: 'action', highlight: '⚠️ PREGNANCY PROTOCOL ACTIVE' },
      { narrative: 'Drug Check: Doctor considers Ibuprofen for pain. System flags DANGER: NSAIDs contraindicated in pregnancy, especially 3rd trimester. Pregnancy-safe alternatives suggested.', type: 'action', highlight: '⚠️ DRUG CHECK: Ibuprofen → DANGER (Pregnancy)' },
      { narrative: 'Auto-translated to Arabic for patient comfort. Medical instructions displayed in both Arabic and English.', type: 'action' },
      { narrative: "Husband Youssef's fingerprint co-registered for consent. Verified consent proxy activated.", type: 'action' },
      { narrative: '✓ Outcome: Pregnancy-safe treatment given. Fetal monitoring active. Informed consent obtained. Cultural sensitivity maintained.', type: 'result' },
    ],
  },
];

export function ScenarioWalkthrough() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (selectedScenario && currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePlay = () => {
    if (!selectedScenario) return;
    setIsPlaying(true);
    let step = currentStep;
    const interval = setInterval(() => {
      step++;
      if (step >= selectedScenario.steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(step);
    }, 3000);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Scenario selection view
  if (!selectedScenario) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-2">Interactive Scenarios</h2>
        <p className="text-slate-400 text-sm mb-6">Walk through real-world emergency scenarios step by step</p>
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <motion.button
              key={scenario.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelectScenario(scenario)}
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors text-left flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center ${scenario.color}`}>
                {scenario.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{scenario.title}</h3>
                <p className="text-xs text-slate-400 truncate">{scenario.subtitle}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Step walkthrough view
  const step = selectedScenario.steps[currentStep];
  const progress = ((currentStep + 1) / selectedScenario.steps.length) * 100;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => { setSelectedScenario(null); setCurrentStep(0); setIsPlaying(false); }}
          className="text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className={`w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center ${selectedScenario.color}`}>
          {selectedScenario.icon}
        </div>
        <div>
          <h3 className="font-semibold text-sm">{selectedScenario.title}</h3>
          <p className="text-xs text-slate-400">{selectedScenario.subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-red-500 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Narrative card */}
          <div className={`p-5 rounded-xl border mb-4 ${
            step.type === 'narrative' ? 'bg-slate-800/30 border-slate-700/50' :
            step.type === 'action' ? 'bg-amber-950/20 border-amber-800/30' :
            'bg-emerald-950/20 border-emerald-800/30'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${
                step.type === 'narrative' ? 'text-slate-400' :
                step.type === 'action' ? 'text-amber-400' :
                'text-emerald-400'
              }`}>
                {step.type === 'narrative' ? <Activity className="w-5 h-5" /> :
                 step.type === 'action' ? <AlertTriangle className="w-5 h-5" /> :
                 <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm leading-relaxed">{step.narrative}</p>
                {step.highlight && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50">
                    <p className="text-xs font-mono text-amber-300">{step.highlight}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data display */}
          {step.data && (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 mb-4">
              {step.data.riskScore && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-full bg-red-950/50 border-2 border-red-700 flex items-center justify-center">
                    <span className="text-xl font-bold text-red-300">{step.data.riskScore as number}</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-red-400">{step.data.level as string}</span>
                    <p className="text-xs text-slate-400">AI Risk Score</p>
                  </div>
                </div>
              )}
              {step.data.factors && (
                <div className="space-y-1 mb-3">
                  {(step.data.factors as string[]).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {step.data.flags && (
                <div className="space-y-1 mb-3">
                  {(step.data.flags as string[]).map((f, i) => (
                    <div key={i} className="px-2 py-1 rounded bg-red-950/40 border border-red-800/40 text-xs text-red-300">
                      {f}
                    </div>
                  ))}
                </div>
              )}
              {step.data.bloodType && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 rounded bg-red-950/50 border border-red-800/50 text-red-300 font-bold">{step.data.bloodType as string}</span>
                  <span className="text-slate-400">Blood Type</span>
                </div>
              )}
              {step.data.allergies && (
                <div className="mt-2 space-y-1">
                  {(step.data.allergies as string[]).map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-red-300">
                      <AlertTriangle className="w-3 h-3" /> {a}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlay}
            disabled={isPlaying}
            className="text-slate-400 hover:text-white"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentStep === selectedScenario.steps.length - 1}
          className="text-slate-400 hover:text-white"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 mt-3">
        {selectedScenario.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentStep ? 'bg-red-500' : i < currentStep ? 'bg-slate-500' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
