import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId, currentSymptoms, vitals } = await request.json();
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true, medications: true, conditions: true, surgeries: true,
        implants: true, pharmacogenomics: true, vitalBaselines: true,
        geneticFlags: true, occupationalExposures: true, deviceIntegrations: true,
        user: { select: { name: true } },
      }
    });

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const conditions = patient.conditions.filter(c => c.status === 'active' || c.status === 'chronic').map(c => c.name);
    const medications = patient.medications.map(m => `${m.name} ${m.dose}`);
    const allergies = patient.allergies.map(a => `${a.name} (${a.severity})`);
    const genomics = patient.pharmacogenomics.map(p => `${p.gene}: ${p.variant} - ${p.implications}`);
    const implants = patient.implants.map(i => `${i.name} at ${i.bodyLocation}`);
    const vitalsBaseline: Record<string, number> = {};
    patient.vitalBaselines.forEach(v => { vitalsBaseline[v.vitalType] = v.value; });

    // Rule-based differential diagnosis engine
    const diagnoses: { condition: string; probability: number; reasoning: string; urgency: string }[] = [];

    const symptoms = (currentSymptoms || '').toLowerCase();

    // Cardiac patterns
    if (symptoms.includes('chest pain') || symptoms.includes('chest pressure') || symptoms.includes('shortness of breath')) {
      if (conditions.includes('Atrial Fibrillation')) {
        diagnoses.push({ condition: 'Cardiac Embolism / STEMI', probability: 82, reasoning: 'A-fib history + chest pain → high cardiac event probability. A-fib causes stasis and clot formation. Cardiac embolism to coronary arteries must be ruled out urgently.', urgency: 'CRITICAL' });
        diagnoses.push({ condition: 'Pulmonary Embolism', probability: 15, reasoning: 'A-fib + anticoagulation (if subtherapeutic) + chest pain → PE possible. Check INR/anti-Xa level.', urgency: 'CRITICAL' });
      }
      if (conditions.includes('Hypertension')) {
        diagnoses.push({ condition: 'Acute Coronary Syndrome', probability: 65, reasoning: 'Hypertension + possible chest pain → ACS workup required. Check troponin, ECG.', urgency: 'CRITICAL' });
      }
      diagnoses.push({ condition: 'Aortic Dissection', probability: 5, reasoning: 'Hypertension + chest pain → dissection must be ruled out. Check BP in both arms, chest X-ray.', urgency: 'CRITICAL' });
    }

    // Neurological patterns
    if (symptoms.includes('seizure') || symptoms.includes('convulsion') || symptoms.includes('unconscious')) {
      if (conditions.includes('Dravet Syndrome')) {
        diagnoses.push({ condition: 'Dravet Syndrome Seizure / Status Epilepticus', probability: 90, reasoning: 'Known Dravet Syndrome + seizure activity → likely disease-related seizure. Check for triggers: fever, missed medications, contraindicated drug exposure.', urgency: 'CRITICAL' });
      }
      if (medications.some(m => m.toLowerCase().includes('lithium'))) {
        diagnoses.push({ condition: 'Lithium Toxicity', probability: 45, reasoning: 'Lithium therapy + altered consciousness → check lithium level. Dehydration increases risk.', urgency: 'HIGH' });
      }
      diagnoses.push({ condition: 'Stroke / TIA', probability: 30, reasoning: 'Unconscious + A-fib history → embolic stroke possible. Check FAST, CT head stat.', urgency: 'CRITICAL' });
    }

    // Respiratory patterns
    if (symptoms.includes('breathing difficulty') || symptoms.includes('wheezing') || symptoms.includes('respiratory distress')) {
      if (conditions.some(c => c.includes('COPD') || c.includes('Asthma'))) {
        diagnoses.push({ condition: 'COPD/Asthma Exacerbation', probability: 75, reasoning: 'Known respiratory condition + breathing difficulty → exacerbation likely.', urgency: 'HIGH' });
      }
      diagnoses.push({ condition: 'Pulmonary Embolism', probability: 20, reasoning: 'Dyspnea must always consider PE, especially with immobility or clotting disorders.', urgency: 'HIGH' });
    }

    // Abdominal patterns
    if (symptoms.includes('abdominal pain') || symptoms.includes('stomach pain')) {
      if (conditions.includes('Atrial Fibrillation')) {
        diagnoses.push({ condition: 'Mesenteric Ischemia', probability: 40, reasoning: 'A-fib + abdominal pain → mesenteric embolism must be ruled out. Mortality 60-80%. This is frequently missed.', urgency: 'CRITICAL' });
      }
      if (medications.some(m => m.toLowerCase().includes('nsaid') || m.toLowerCase().includes('eliquis') || m.toLowerCase().includes('warfarin'))) {
        diagnoses.push({ condition: 'GI Hemorrhage', probability: 35, reasoning: 'Anticoagulant/NSAID use + abdominal pain → GI bleeding possible. Check Hb, stool guaiac.', urgency: 'HIGH' });
      }
    }

    // Trauma patterns
    if (symptoms.includes('trauma') || symptoms.includes('fall') || symptoms.includes('accident')) {
      if (implants.some(i => i.toLowerCase().includes('pacemaker'))) {
        diagnoses.push({ condition: 'Pacemaker Dislodgement', probability: 25, reasoning: 'Trauma + pacemaker → device may be dislodged. Check pacing, chest X-ray.', urgency: 'HIGH' });
      }
      if (patient.surgeries.some(s => s.bodyRegion === 'spine')) {
        diagnoses.push({ condition: 'Spinal Injury at Fusion Site', probability: 30, reasoning: 'Prior spinal fusion + trauma → injury at fusion level. Full spinal precautions required.', urgency: 'CRITICAL' });
      }
    }

    // Default if no specific patterns matched
    if (diagnoses.length === 0) {
      diagnoses.push({
        condition: 'Undifferentiated Emergency',
        probability: 50,
        reasoning: `Based on patient profile (age ${age}, conditions: ${conditions.join(', ') || 'none known'}, medications: ${medications.join(', ') || 'none'}), further workup needed. Vitals and exam findings will guide differential.`,
        urgency: 'MODERATE'
      });
    }

    // Sort by probability
    diagnoses.sort((a, b) => b.probability - a.probability);

    return NextResponse.json({
      patientName: patient.user.name,
      age,
      conditions,
      symptoms: currentSymptoms,
      diagnoses,
      redFlags: allergies,
      geneticWarnings: genomics,
      implantAlerts: implants,
      vitalsBaseline,
      currentVitals: vitals || null,
    });
  } catch (error) {
    console.error('Differential diagnosis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
