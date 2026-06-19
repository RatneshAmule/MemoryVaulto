import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RiskFactor {
  name: string;
  points: number;
  category: string;
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
        allergies: true,
        medications: true,
        conditions: true,
        surgeries: true,
        implants: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const factors: RiskFactor[] = [];
    let score = 0;

    // Age factor
    const dob = new Date(patient.dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age >= 75) {
      score += 25;
      factors.push({ name: `Age ${age} (75+)`, points: 25, category: 'demographic' });
    } else if (age >= 65) {
      score += 15;
      factors.push({ name: `Age ${age} (65+)`, points: 15, category: 'demographic' });
    }

    // Condition factor
    const cardiacConditions = ['Atrial Fibrillation', 'A-Fib', 'Heart Failure', 'Myocardial Infarction', 'Prior MI', 'Prior Myocardial Infarction'];
    const diabetesConditions = ['Diabetes', 'Type 1 Diabetes', 'Type 2 Diabetes'];
    const respiratoryConditions = ['Asthma', 'COPD'];

    for (const condition of patient.conditions) {
      if (condition.status !== 'active') continue;
      const name = condition.name.toLowerCase();
      const isCardiac = cardiacConditions.some(c => name.includes(c.toLowerCase()));
      const isDiabetes = diabetesConditions.some(c => name.includes(c.toLowerCase()));
      const isRespiratory = respiratoryConditions.some(c => name.includes(c.toLowerCase()));
      const isHypertension = name.includes('hypertension');
      const isObesity = name.includes('obesity');
      const isCancer = name.includes('cancer') || name.includes('malignancy');

      if (isCardiac) {
        score += 15;
        factors.push({ name: `Cardiac: ${condition.name}`, points: 15, category: 'condition' });
      } else if (isDiabetes) {
        score += 10;
        factors.push({ name: `Diabetes: ${condition.name}`, points: 10, category: 'condition' });
      } else if (isRespiratory) {
        score += 10;
        factors.push({ name: `Respiratory: ${condition.name}`, points: 10, category: 'condition' });
      } else if (isHypertension) {
        score += 8;
        factors.push({ name: `Hypertension: ${condition.name}`, points: 8, category: 'condition' });
      } else if (isObesity) {
        score += 5;
        factors.push({ name: `Obesity: ${condition.name}`, points: 5, category: 'condition' });
      } else if (isCancer) {
        score += 15;
        factors.push({ name: `Cancer: ${condition.name}`, points: 15, category: 'condition' });
      } else {
        score += 5;
        factors.push({ name: condition.name, points: 5, category: 'condition' });
      }
    }

    // Medication factor
    const anticoagulants = ['Warfarin', 'Eliquis', 'Apixaban', 'Rivaroxaban', 'Xarelto', 'Heparin'];
    const insulinMeds = ['Insulin', 'Insulin Glargine', 'Insulin Lispro', 'Insulin Aspart'];

    for (const med of patient.medications) {
      const name = med.name.toLowerCase();
      if (anticoagulants.some(a => name.includes(a.toLowerCase()))) {
        score += 10;
        factors.push({ name: `Anticoagulant: ${med.name}`, points: 10, category: 'medication' });
      }
      if (insulinMeds.some(i => name.includes(i.toLowerCase()))) {
        score += 8;
        factors.push({ name: `Insulin: ${med.name}`, points: 8, category: 'medication' });
      }
    }

    // Polypharmacy
    if (patient.medications.length >= 5) {
      score += 10;
      factors.push({ name: `Polypharmacy (${patient.medications.length} medications)`, points: 10, category: 'medication' });
    }

    // Allergy factor
    for (const allergy of patient.allergies) {
      if (allergy.severity === 'severe') {
        score += 5;
        factors.push({ name: `Severe allergy: ${allergy.name}`, points: 5, category: 'allergy' });
      }
    }

    // DNR factor
    if (patient.dnr) {
      score += 10;
      factors.push({ name: 'DNR Order', points: 10, category: 'directive' });
    }

    // Surgery factor — recent surgery (within 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    for (const surgery of patient.surgeries) {
      const surgeryDate = new Date(surgery.date);
      if (surgeryDate > sixMonthsAgo) {
        score += 10;
        factors.push({ name: `Recent surgery: ${surgery.name}`, points: 10, category: 'surgical' });
      }
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Classify
    let level: string;
    if (score <= 30) level = 'LOW';
    else if (score <= 60) level = 'ELEVATED';
    else if (score <= 80) level = 'HIGH';
    else level = 'CRITICAL';

    // Recommendations
    const recommendations: string[] = [];
    if (level === 'CRITICAL') recommendations.push('Continuous cardiac monitoring recommended');
    if (level === 'CRITICAL' || level === 'HIGH') recommendations.push('Consider ICU-level care');
    if (patient.medications.length >= 5) recommendations.push('Pharmacy review for polypharmacy interactions');
    if (anticoagulants.some(a => patient.medications.some(m => m.name.toLowerCase().includes(a.toLowerCase())))) {
      recommendations.push('Monitor coagulation panels; bleeding risk elevated');
    }
    if (insulinMeds.some(i => patient.medications.some(m => m.name.toLowerCase().includes(i.toLowerCase())))) {
      recommendations.push('Monitor blood glucose; ensure DKA protocol available');
    }
    if (patient.allergies.some(a => a.severity === 'severe')) {
      recommendations.push('Verify allergy band applied; ensure epinephrine available');
    }
    if (patient.dnr) recommendations.push('Comfort care pathway — respect advance directive');
    if (age >= 65) recommendations.push('Fall risk assessment recommended');
    if (patient.pregnancyStatus === 'confirmed' || patient.pregnancyStatus === 'possible') {
      recommendations.push('Pregnancy-safe medication protocols active');
    }
    if (level === 'LOW') recommendations.push('Standard monitoring protocol appropriate');

    return NextResponse.json({ score, level, factors, recommendations });
  } catch (error) {
    console.error('Risk score error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
