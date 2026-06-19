import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Protocol {
  name: string;
  priority: 'critical' | 'high' | 'moderate' | 'low';
  steps: string[];
  triggeredBy: string;
}

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId');
    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        conditions: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const protocols: Protocol[] = [];
    const conditionNames = patient.conditions
      .filter(c => c.status === 'active')
      .map(c => c.name.toLowerCase());

    // Atrial Fibrillation / A-Fib → Cardiac Protocol
    if (conditionNames.some(c => c.includes('atrial fibrillation') || c.includes('a-fib') || c.includes('afib'))) {
      protocols.push({
        name: 'Cardiac Protocol',
        priority: 'critical',
        steps: [
          'Monitor cardiac enzymes (Troponin I/Q)',
          'Obtain 12-lead ECG',
          'Initiate rate control (beta-blocker or calcium channel blocker)',
          'Assess for anticoagulation needs (CHA2DS2-VASc score)',
          'Continuous cardiac monitoring',
          'Assess hemodynamic stability',
        ],
        triggeredBy: 'Atrial Fibrillation / A-Fib detected',
      });
    }

    // Diabetes → Diabetic Protocol
    if (conditionNames.some(c => c.includes('diabetes') || c.includes('diabetic'))) {
      protocols.push({
        name: 'Diabetic Protocol',
        priority: 'high',
        steps: [
          'Check blood glucose immediately',
          'Monitor for DKA (diabetic ketoacidosis) signs: Kussmaul breathing, fruity breath',
          'Monitor for HHS (hyperosmolar hyperglycemic state)',
          'Check insulin administration history',
          'Assess for hypoglycemia if altered consciousness',
          'Prepare D50 or glucagon if hypoglycemic',
        ],
        triggeredBy: 'Diabetes detected',
      });
    }

    // Hypertension → could be hypertensive emergency if + chest pain
    if (conditionNames.some(c => c.includes('hypertension'))) {
      protocols.push({
        name: 'Hypertensive Emergency Protocol',
        priority: 'high',
        steps: [
          'Obtain bilateral blood pressures',
          'Assess for end-organ damage (chest pain, neurological deficits, renal function)',
          'If SBP > 180 or DBP > 120 with end-organ damage: IV antihypertensives',
          'Target MAP reduction no more than 25% in first hour',
          'Continuous BP monitoring',
          'Neurological checks q15min',
        ],
        triggeredBy: 'Hypertension detected',
      });
    }

    // Prior MI → STEMI Watch
    if (conditionNames.some(c => c.includes('myocardial infarction') || c.includes('prior mi') || c.includes('heart attack'))) {
      protocols.push({
        name: 'STEMI Watch',
        priority: 'critical',
        steps: [
          'Serial troponins (0, 3, 6 hours)',
          'Continuous ECG monitoring',
          'Assess for recurrent chest pain',
          'Maintain dual antiplatelet therapy',
          'Cardiology consult',
          'Prepare for possible catheterization',
        ],
        triggeredBy: 'Prior Myocardial Infarction detected',
      });
    }

    // Asthma / COPD → Respiratory Protocol
    if (conditionNames.some(c => c.includes('asthma') || c.includes('copd') || c.includes('respiratory'))) {
      protocols.push({
        name: 'Respiratory Protocol',
        priority: 'high',
        steps: [
          'SpO2 monitoring — maintain > 92%',
          'Bronchodilator readiness (albuterol neb/IPV)',
          'Assess work of breathing',
          'Prepare for possible intubation if declining',
          'Chest X-ray',
          'ABG if SpO2 < 90% or clinical deterioration',
        ],
        triggeredBy: 'Respiratory condition detected',
      });
    }

    // Obesity → Difficult Airway Alert
    if (conditionNames.some(c => c.includes('obesity') || c.includes('obese'))) {
      protocols.push({
        name: 'Difficult Airway Alert',
        priority: 'moderate',
        steps: [
          'Assess airway: Mallampati score, neck circumference',
          'Have difficult airway equipment available (video laryngoscope, LMA)',
          'Position: ramped position for intubation',
          'Prepare for rapid sequence intubation challenges',
          'Consider awake fiberoptic intubation if anticipated difficulty',
        ],
        triggeredBy: 'Obesity detected — difficult airway risk',
      });
    }

    // Pregnancy → Pregnancy Protocol
    if (conditionNames.some(c => c.includes('pregnancy') || c.includes('pregnant')) ||
        patient.pregnancyStatus === 'confirmed' || patient.pregnancyStatus === 'possible') {
      protocols.push({
        name: 'Pregnancy Protocol',
        priority: 'critical',
        steps: [
          'Determine gestational age',
          'Fetal monitoring if viable gestation (>24 weeks)',
          'Left lateral tilt position (avoid aortocaval compression)',
          'Pregnancy-safe medication verification',
          'Obstetric consult',
          'Rh status verification if trauma',
        ],
        triggeredBy: 'Pregnancy detected',
      });
    }

    // Epilepsy / Seizure → Seizure Precautions
    if (conditionNames.some(c => c.includes('epilepsy') || c.includes('seizure') || c.includes('dravet'))) {
      protocols.push({
        name: 'Seizure Precautions',
        priority: 'high',
        steps: [
          'Padded side rails up',
          'Suction at bedside',
          'Bite block available (do not force into mouth during seizure)',
          'Rescue medication ready (lorazepam/diazepam IV)',
          'Seizure precautions signage on door',
          'Avoid carbamazepine/phenytoin in Dravet Syndrome',
          'Continuous observation',
        ],
        triggeredBy: 'Seizure disorder detected',
      });
    }

    // DNR → Comfort Care Pathway
    if (patient.dnr) {
      protocols.push({
        name: 'Comfort Care Pathway',
        priority: 'high',
        steps: [
          'Verify DNR order in chart',
          'Comfort measures only — no resuscitation',
          'Pain management priority',
          'Notify family and care team',
          'Ensure dignity in care delivery',
        ],
        triggeredBy: 'DNR order on file',
      });
    }

    // Immunocompromised flag
    if (conditionNames.some(c => c.includes('immunocompromised') || c.includes('immunosuppressed') || c.includes('hiv'))) {
      protocols.push({
        name: 'Immunocompromised Precautions',
        priority: 'high',
        steps: [
          'Isolation room assignment',
          'Strict hand hygiene enforcement',
          'Limit visitor exposure',
          'Broad-spectrum antibiotic readiness if infection suspected',
          'Avoid live vaccines',
        ],
        triggeredBy: 'Immunocompromised status detected',
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
    protocols.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return NextResponse.json({ protocols });
  } catch (error) {
    console.error('Triage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
