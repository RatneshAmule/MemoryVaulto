import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId } = await request.json();
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: { medications: true, medicalTests: true, conditions: true, medicationAdherence: true, user: { select: { name: true } } }
    });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const issues: { type: string; severity: string; description: string; recommendation: string }[] = [];

    // Duplicate medications (same class)
    const medClasses: Record<string, string[]> = {};
    for (const med of patient.medications) {
      const cls = med.category || 'uncategorized';
      if (!medClasses[cls]) medClasses[cls] = [];
      medClasses[cls].push(med.name);
    }
    for (const [cls, meds] of Object.entries(medClasses)) {
      if (meds.length > 1 && cls !== 'uncategorized') {
        issues.push({ type: 'duplicate', severity: 'warning', description: `Duplicate ${cls} medications: ${meds.join(', ')}`, recommendation: 'Review if both are needed. Duplicate therapy may increase side effects.' });
      }
    }

    // Medication gaps - guideline-recommended
    const hasDiabetes = patient.conditions.some(c => c.name.toLowerCase().includes('diabetes'));
    const hasHypertension = patient.conditions.some(c => c.name.toLowerCase().includes('hypertension'));
    const hasAFib = patient.conditions.some(c => c.name.toLowerCase().includes('atrial fibrillation'));
    const isOnStatin = patient.medications.some(m => m.name.toLowerCase().includes('statin') || m.name.toLowerCase().includes('atorvastatin') || m.name.toLowerCase().includes('rosuvastatin'));
    const isOnAnticoagulant = patient.medications.some(m => m.name.toLowerCase().includes('eliquis') || m.name.toLowerCase().includes('warfarin') || m.name.toLowerCase().includes('apixaban') || m.name.toLowerCase().includes('rivaroxaban'));

    if (hasDiabetes && !isOnStatin) {
      issues.push({ type: 'gap', severity: 'warning', description: 'Diabetic patient not on statin (ADA guideline-recommended)', recommendation: 'Consider adding statin per ADA guidelines for diabetic patients >40yo' });
    }
    if (hasAFib && !isOnAnticoagulant) {
      issues.push({ type: 'gap', severity: 'danger', description: 'Atrial fibrillation patient NOT on anticoagulation — high stroke risk', recommendation: 'Urgent: Initiate anticoagulation per CHA2DS2-VASc score' });
    }

    // Dose range checks
    for (const med of patient.medications) {
      const dose = parseFloat(med.dose);
      if (med.name.toLowerCase().includes('metformin') && dose > 2550) {
        issues.push({ type: 'dose', severity: 'warning', description: `Metformin ${dose}mg exceeds max recommended dose (2550mg/day)`, recommendation: 'Reduce dose to ≤2550mg/day' });
      }
    }

    // Duplicate tests
    const recentTests: Record<string, { date: string; facility: string }[]> = {};
    for (const test of patient.medicalTests) {
      if (!recentTests[test.testName]) recentTests[test.testName] = [];
      recentTests[test.testName].push({ date: test.testDate.toString(), facility: test.facility || 'unknown' });
    }
    for (const [testName, entries] of Object.entries(recentTests)) {
      if (entries.length > 1) {
        issues.push({ type: 'duplicate-test', severity: 'caution', description: `${testName} done ${entries.length} times. Previous: ${entries.map(e => `${e.date} at ${e.facility}`).join('; ')}`, recommendation: 'Check if repeat is necessary — may be a duplicate test' });
      }
    }

    // Low adherence flags
    for (const adh of patient.medicationAdherence) {
      if (adh.overallScore < 60) {
        issues.push({ type: 'adherence', severity: 'warning', description: `${adh.medicationName} adherence: ${adh.overallScore}% — medication list may be unreliable for this drug`, recommendation: 'Verify if patient is actually taking this medication. Re-verify in ER.' });
      }
    }

    return NextResponse.json({
      patientId, patientName: patient.user.name,
      issues,
      totalMedications: patient.medications.length,
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'danger').length,
    });
  } catch (error) {
    console.error('Medication reconciliation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
