import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId, procedureType } = await request.json();
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true, medications: true, conditions: true, surgeries: true,
        implants: true, geneticFlags: true, pharmacogenomics: true,
        culturalDirectives: true, bloodAntibodies: true, vaccinations: true,
        advanceDirectives: true, painProfile: true,
        user: { select: { name: true } },
      }
    });

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const checklist: { category: string; items: { text: string; priority: string; checked: boolean }[] }[] = [];

    // Allergy checks
    checklist.push({
      category: 'Allergy Verification',
      items: patient.allergies.map(a => ({
        text: `Verify ${a.name} allergy (${a.severity}) — Ensure no ${a.name} in surgical prep/meds${a.crossReactivity ? `. Cross-reacts with: ${a.crossReactivity}` : ''}`,
        priority: a.severity === 'life-threatening' || a.severity === 'severe' ? 'CRITICAL' : 'HIGH',
        checked: false
      }))
    });

    // Implant checks
    if (patient.implants.length > 0) {
      checklist.push({
        category: 'Implant & Device Management',
        items: patient.implants.map(i => ({
          text: `Implant: ${i.name} at ${i.bodyLocation}. ${i.mriSafe ? 'MRI safe.' : 'NOT MRI-safe — avoid MRI.'} ${i.manufacturer ? `Mfr: ${i.manufacturer}` : ''} ${i.serialNumber ? `S/N: ${i.serialNumber}` : ''}${i.name.toLowerCase().includes('pacemaker') ? ' → Switch to magnet mode before surgery. Avoid electrocautery near chest.' : ''}`,
          priority: 'CRITICAL',
          checked: false
        }))
      });
    }

    // Blood compatibility
    checklist.push({
      category: 'Blood Products',
      items: [
        { text: `Blood type: ${patient.bloodType}${patient.rhFactor || ''} — Verify type & crossmatch ${procedureType === 'surgery' ? '2 units' : 'as needed'}`, priority: 'HIGH', checked: false },
        ...patient.bloodAntibodies.map(b => ({
          text: `Antibody: ${b.antibody} (${b.significance}) — Extended crossmatch required. Alert blood bank.`,
          priority: 'CRITICAL' as string, checked: false
        })),
      ]
    });

    // Medication management
    const medItems = patient.medications.map(m => {
      if (m.name.toLowerCase().includes('eliquis') || m.name.toLowerCase().includes('warfarin') || m.name.toLowerCase().includes('apixaban')) {
        return { text: `HOLD ${m.name} — Reverse anticoagulation. ${m.name.toLowerCase().includes('eliquis') ? 'Andexanet alfa for reversal.' : m.name.toLowerCase().includes('warfarin') ? 'Vitamin K + PCC for reversal.' : 'Consult hematology.'} Check coags before incision.`, priority: 'CRITICAL' as string, checked: false };
      }
      if (m.name.toLowerCase().includes('metformin')) {
        return { text: `HOLD ${m.name} 48 hours before/after IV contrast. Monitor creatinine.`, priority: 'HIGH' as string, checked: false };
      }
      if (m.name.toLowerCase().includes('insulin')) {
        return { text: `Adjust ${m.name} dosing peri-operatively. Dextrose drip may be needed. Monitor glucose hourly.`, priority: 'HIGH' as string, checked: false };
      }
      return { text: `Continue ${m.name} ${m.dose} ${m.frequency} — Verify dose and timing`, priority: 'MODERATE' as string, checked: false };
    });
    checklist.push({ category: 'Medication Management', items: medItems });

    // Genetic flags
    if (patient.geneticFlags.length > 0) {
      checklist.push({
        category: 'Genetic Safety',
        items: patient.geneticFlags.map(g => ({
          text: `GENETIC FLAG: ${g.condition}. AVOID: ${g.medicationsToAvoid}. SAFE: ${g.safeAlternatives}. ${g.implications}${g.familyScreening ? ' — Family screening recommended.' : ''}`,
          priority: 'CRITICAL',
          checked: false
        }))
      });
    }

    // Cultural/religious
    if (patient.culturalDirectives.length > 0) {
      checklist.push({
        category: 'Cultural & Religious Requirements',
        items: patient.culturalDirectives.map(cd => ({
          text: `${cd.religion}: ${cd.description}. ${cd.overrideAllowed ? 'Override possible with patient consent.' : 'OVERRIDE NOT ALLOWED.'}`,
          priority: cd.overrideAllowed ? 'HIGH' : 'CRITICAL',
          checked: false
        }))
      });
    }

    // DNR/Advance directives
    if (patient.dnr || patient.advanceDirectives.some(d => d.directiveType === 'dnr')) {
      checklist.push({
        category: 'End-of-Life Directives',
        items: [
          { text: 'DNR/DNI ACTIVE — Do NOT resuscitate. Comfort care only if cardiac arrest. Confirm with proxy.', priority: 'CRITICAL', checked: false },
          ...patient.advanceDirectives.filter(d => d.directiveType !== 'dnr').map(d => ({
            text: `${d.directiveType}: ${d.description}`,
            priority: 'HIGH' as string, checked: false
          }))
        ]
      });
    }

    // Pain management
    if (patient.painProfile) {
      const pp = patient.painProfile;
      checklist.push({
        category: 'Pain Management Plan',
        items: [
          { text: `Opioid tolerance: ${pp.opioidTolerance}. ${pp.opioidTolerance !== 'naive' ? 'May need higher/titrated doses.' : 'Use standard dosing with caution.'}`, priority: 'HIGH', checked: false },
          { text: `Effective pain meds: ${pp.effectiveMedications || 'None listed'}`, priority: 'MODERATE', checked: false },
          { text: `Ineffective pain meds: ${pp.ineffectiveMedications || 'None listed'}`, priority: 'MODERATE', checked: false },
          ...(pp.painMedAllergies ? [{ text: `Pain med allergies: ${pp.painMedAllergies}`, priority: 'HIGH' as string, checked: false }] : []),
          ...(pp.painManagementDoctor ? [{ text: `Pain management MD: ${pp.painManagementDoctor}`, priority: 'MODERATE' as string, checked: false }] : []),
        ]
      });
    }

    // Vaccination gaps
    const overdueVax = patient.vaccinations.filter(v => v.status === 'overdue' || v.status === 'due');
    if (overdueVax.length > 0) {
      checklist.push({
        category: 'Vaccination Gaps',
        items: overdueVax.map(v => ({
          text: `${v.name}: ${v.status.toUpperCase()} (last: ${v.date})${v.nextDue ? `, due: ${v.nextDue}` : ''}`,
          priority: 'MODERATE',
          checked: false
        }))
      });
    }

    // Latex allergy check
    if (patient.allergies.some(a => a.name.toLowerCase().includes('latex'))) {
      checklist.push({
        category: 'Latex-Free Setup',
        items: [
          { text: 'LATEX ALLERGY — Use nitrile gloves, latex-free catheters, latex-free BP cuff, latex-free tourniquet', priority: 'CRITICAL', checked: false },
          { text: 'Verify OR/room is latex-safe. Alert all staff.', priority: 'HIGH', checked: false },
        ]
      });
    }

    const totalItems = checklist.reduce((sum, cat) => sum + cat.items.length, 0);
    const criticalItems = checklist.reduce((sum, cat) => sum + cat.items.filter(i => i.priority === 'CRITICAL').length, 0);

    return NextResponse.json({
      patientId,
      patientName: patient.user.name,
      procedureType: procedureType || 'general',
      checklist,
      summary: { totalItems, criticalItems, categories: checklist.length },
      readinessScore: Math.max(0, 100 - (criticalItems * 10)),
    });
  } catch (error) {
    console.error('Surgery checklist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
