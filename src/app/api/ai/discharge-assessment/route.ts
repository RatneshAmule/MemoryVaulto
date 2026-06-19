import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId, transportAvailable, pharmacyAccess, foodSecurity, socialSupport, healthLiteracy, followUpScheduled, homeHealthNeeded } = await request.json();
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: { conditions: true, medications: true, medicationAdherence: true, emergencyContacts: true, user: { select: { name: true } } }
    });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    let score = 100;
    const risks: string[] = [];
    const interventions: string[] = [];

    if (!transportAvailable) { score -= 15; risks.push('No transportation home'); interventions.push('Arrange medical transport or ride-share'); }
    if (!pharmacyAccess) { score -= 15; risks.push('No 24hr pharmacy access'); interventions.push('Medication delivery service or discharge Rx to pharmacy near home'); }
    if (!foodSecurity) { score -= 10; risks.push('Food insecurity'); interventions.push('Social work referral, meal delivery service'); }
    if (!socialSupport) { score -= 20; risks.push('Lives alone, no support'); interventions.push('Home health aide, daily check-in calls, community resources'); }
    if (healthLiteracy === 'low') { score -= 10; risks.push('Low health literacy'); interventions.push('Simplified discharge instructions, teach-back method, picture-based guides'); }
    if (!followUpScheduled) { score -= 10; risks.push('No follow-up scheduled'); interventions.push('Schedule PCP follow-up within 7 days before discharge'); }
    if (homeHealthNeeded) { score -= 5; risks.push('Home health services needed'); interventions.push('Arrange home nursing, PT/OT evaluation'); }

    // Condition-based risks
    const chronicCount = patient.conditions.filter(c => c.status === 'chronic').length;
    if (chronicCount >= 3) { score -= 10; risks.push(`Multiple chronic conditions (${chronicCount})`); interventions.push('Comprehensive discharge planning, medication management support'); }

    const medCount = patient.medications.length;
    if (medCount >= 8) { score -= 5; risks.push(`Polypharmacy (${medCount} medications)`); interventions.push('Medication reconciliation, pill organizer, pharmacy consultation'); }

    // Low adherence patients
    const lowAdh = patient.medicationAdherence.filter(a => a.overallScore < 70);
    if (lowAdh.length > 0) { score -= 10; risks.push(`Low adherence: ${lowAdh.map(a => a.medicationName).join(', ')}`); interventions.push('Medication reminder app, simplified regimen, pharmacy follow-up'); }

    // Age risk
    const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age >= 75) { score -= 5; risks.push('Elderly (75+)'); interventions.push('Fall risk assessment, caregiver education'); }
    if (age < 18) { score -= 5; risks.push('Pediatric patient'); interventions.push('Guardian education, pediatric discharge instructions'); }

    score = Math.max(0, Math.min(100, score));

    const readmissionRisk = Math.min(1, Math.max(0, (100 - score) / 100));

    // Save assessment
    await db.dischargeAssessment.create({
      data: {
        patientId, visitDate: new Date().toISOString(),
        dischargeSafetyScore: score,
        transportAvailable: transportAvailable ?? true,
        pharmacyAccess: pharmacyAccess ?? true,
        foodSecurity: foodSecurity ?? true,
        socialSupport: socialSupport ?? true,
        healthLiteracy: healthLiteracy || 'moderate',
        followUpScheduled: followUpScheduled ?? false,
        homeHealthNeeded: homeHealthNeeded ?? false,
        readmissionRisk,
        interventions: JSON.stringify(interventions),
        aiRecommendation: score < 50 ? 'DISCHARGE NOT RECOMMENDED without supervised setting. Social work consult required.' : score < 70 ? 'Discharge with additional support services. Follow up within 48 hours.' : 'Safe for discharge with standard follow-up.',
      }
    });

    return NextResponse.json({
      patientId, patientName: patient.user.name,
      dischargeSafetyScore: score,
      readmissionRisk: Math.round(readmissionRisk * 100) / 100,
      risks,
      interventions,
      recommendation: score < 50 ? 'HIGH RISK — Social work consult required before discharge' : score < 70 ? 'MODERATE RISK — Additional support services needed' : 'LOW RISK — Safe for discharge with standard follow-up',
      level: score < 50 ? 'danger' : score < 70 ? 'warning' : 'safe',
    });
  } catch (error) {
    console.error('Discharge assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
