'use client';

import { create } from 'zustand';

export type DemoTab = 'emergency' | 'vault' | 'hospital' | 'ai';

export interface PatientAllergy {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface PatientMedication {
  name: string;
  dose: string;
  frequency: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: PatientAllergy[];
  medications: PatientMedication[];
  conditions: string[];
  criticalFlags: string[];
  dnr: boolean;
  emergencyContacts: EmergencyContact[];
  surgeries?: string[];
  implants?: string[];
  vaccinations?: string[];
}

export interface HospitalPatient {
  id: string;
  name: string;
  eta: string;
  criticality: 'critical' | 'urgent' | 'stable';
  bloodType: string;
  allergies: string[];
  conditions: string[];
  status: 'en-route' | 'in-triage' | 'in-treatment';
  flags: string[];
}

export interface DrugCheckResult {
  drug: string;
  safe: boolean;
  reason?: string;
}

const DRUG_DATABASE: Record<string, (patient: Patient) => DrugCheckResult> = {
  Ibuprofen: (p) => ({
    drug: 'Ibuprofen',
    safe: !p.allergies.some((a) => a.name === 'NSAIDs'),
    reason: p.allergies.some((a) => a.name === 'NSAIDs')
      ? 'CONTRAINDICATED — Patient allergic to NSAIDs'
      : undefined,
  }),
  Amoxicillin: (p) => ({
    drug: 'Amoxicillin',
    safe: !p.allergies.some((a) => a.name === 'Penicillin'),
    reason: p.allergies.some((a) => a.name === 'Penicillin')
      ? 'CONTRAINDICATED — Cross-reactivity with Penicillin allergy'
      : undefined,
  }),
  Morphine: () => ({
    drug: 'Morphine',
    safe: true,
  }),
  Aspirin: (p) => ({
    drug: 'Aspirin',
    safe: !p.allergies.some((a) => a.name === 'NSAIDs'),
    reason: p.allergies.some((a) => a.name === 'NSAIDs')
      ? 'CAUTION — NSAID class, potential cross-reactivity'
      : undefined,
  }),
  Metformin: (p) => ({
    drug: 'Metformin',
    safe: !p.medications.some((m) => m.name === 'Metformin'),
    reason: p.medications.some((m) => m.name === 'Metformin')
      ? 'DUPLICATE — Patient already on Metformin'
      : undefined,
  }),
};

export const PRIMARY_PATIENT: Patient = {
  id: 'p-001',
  name: 'Maria Rodriguez',
  age: 34,
  gender: 'Female',
  bloodType: 'A-',
  allergies: [
    { name: 'Penicillin', severity: 'severe' },
    { name: 'NSAIDs', severity: 'moderate' },
  ],
  medications: [
    { name: 'Insulin Glargine', dose: '22 units', frequency: 'Daily at bedtime' },
    { name: 'Metformin', dose: '500mg', frequency: 'Twice daily' },
  ],
  conditions: ['Type 1 Diabetes', 'Hypothyroidism'],
  criticalFlags: ['TYPE 1 DIABETIC — Monitor Blood Glucose'],
  dnr: false,
  emergencyContacts: [
    { name: 'Carlos Rodriguez', relationship: 'Husband', phone: '+1-555-0147' },
  ],
  surgeries: ['Appendectomy (2018)'],
  implants: [],
  vaccinations: ['COVID-19 (Boosted)', 'Flu (2025)', 'Tdap (2024)'],
};

export const AI_PATIENT: Patient = {
  id: 'p-002',
  name: 'James Wilson',
  age: 72,
  gender: 'Male',
  bloodType: 'O+',
  allergies: [{ name: 'Sulfonamides', severity: 'moderate' }],
  medications: [
    { name: 'Warfarin', dose: '5mg', frequency: 'Daily' },
    { name: 'Metoprolol', dose: '50mg', frequency: 'Twice daily' },
    { name: 'Lisinopril', dose: '10mg', frequency: 'Daily' },
    { name: 'Metformin', dose: '850mg', frequency: 'Twice daily' },
  ],
  conditions: ['Atrial Fibrillation', 'Hypertension', 'Type 2 Diabetes', 'Obesity', 'Prior MI (2023)'],
  criticalFlags: ['A-FIB ON WARFARIN — Check INR before procedures', 'CARDIAC HISTORY — Monitor continuously'],
  dnr: false,
  emergencyContacts: [
    { name: 'Sarah Wilson', relationship: 'Daughter', phone: '+1-555-0283' },
  ],
  surgeries: ['PCI with stent placement (2023)', 'CABG (2019)'],
  implants: ['Coronary stent (LAD)', 'Cardiac loop recorder'],
  vaccinations: ['COVID-19 (Boosted)', 'Pneumococcal', 'Flu (2025)'],
};

export const HOSPITAL_PATIENTS: HospitalPatient[] = [
  {
    id: 'hp-001',
    name: 'Maria Rodriguez',
    eta: '2 min',
    criticality: 'critical',
    bloodType: 'A-',
    allergies: ['Penicillin', 'NSAIDs'],
    conditions: ['Type 1 Diabetes'],
    status: 'en-route',
    flags: ['Unconscious', 'Diabetic emergency suspected'],
  },
  {
    id: 'hp-002',
    name: 'Robert Chen',
    eta: '8 min',
    criticality: 'urgent',
    bloodType: 'B+',
    allergies: [],
    conditions: ['Hypertension', 'Asthma'],
    status: 'en-route',
    flags: ['Chest pain', 'BP 180/110'],
  },
  {
    id: 'hp-003',
    name: 'Eleanor Vance',
    eta: 'Arrived',
    criticality: 'stable',
    bloodType: 'AB+',
    allergies: ['Latex'],
    conditions: ['Osteoarthritis'],
    status: 'in-triage',
    flags: ['Fall injury', 'Right wrist fracture'],
  },
  {
    id: 'hp-004',
    name: 'James Wilson',
    eta: 'Arrived',
    criticality: 'critical',
    bloodType: 'O+',
    allergies: ['Sulfonamides'],
    conditions: ['A-Fib', 'Diabetes', 'Cardiac history'],
    status: 'in-treatment',
    flags: ['STEMI protocol', 'Cath lab notified'],
  },
];

interface VaultState {
  demoTab: DemoTab;
  setDemoTab: (tab: DemoTab) => void;

  vaultUnlocked: boolean;
  setVaultUnlocked: (unlocked: boolean) => void;

  scanning: boolean;
  setScanning: (scanning: boolean) => void;

  selectedDrug: string;
  setSelectedDrug: (drug: string) => void;

  primaryPatient: Patient;
  aiPatient: Patient;
  hospitalPatients: HospitalPatient[];

  expandedScenario: string | null;
  setExpandedScenario: (id: string | null) => void;

  checkDrug: (drugName: string) => DrugCheckResult;
  checkDrugForPatient: (drugName: string, patient: Patient) => DrugCheckResult;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  demoTab: 'emergency',
  setDemoTab: (tab) => set({ demoTab: tab, vaultUnlocked: false, scanning: false, selectedDrug: '' }),

  vaultUnlocked: false,
  setVaultUnlocked: (unlocked) => set({ vaultUnlocked: unlocked }),

  scanning: false,
  setScanning: (scanning) => set({ scanning }),

  selectedDrug: '',
  setSelectedDrug: (drug) => set({ selectedDrug: drug }),

  primaryPatient: PRIMARY_PATIENT,
  aiPatient: AI_PATIENT,
  hospitalPatients: HOSPITAL_PATIENTS,

  expandedScenario: null,
  setExpandedScenario: (id) => set({ expandedScenario: id }),

  checkDrug: (drugName) => {
    const patient = get().primaryPatient;
    return DRUG_DATABASE[drugName]?.(patient) ?? { drug: drugName, safe: true };
  },
  checkDrugForPatient: (drugName, patient) => {
    return DRUG_DATABASE[drugName]?.(patient) ?? { drug: drugName, safe: true };
  },
}));
