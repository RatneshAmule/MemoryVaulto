import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RedFlag {
  text: string;
  severity: 'critical' | 'high' | 'moderate';
  category: string;
  source: string;
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

    const flags: RedFlag[] = [];

    // 1. Severe allergies
    for (const allergy of patient.allergies) {
      if (allergy.severity === 'severe') {
        flags.push({
          text: `SEVERE ALLERGY: ${allergy.name}${allergy.reaction ? ` — ${allergy.reaction}` : ''}`,
          severity: 'critical',
          category: 'allergy',
          source: allergy.name,
        });
      }
    }

    // 2. DNR
    if (patient.dnr) {
      flags.push({
        text: 'DO NOT RESUSCITATE ORDER ON FILE',
        severity: 'critical',
        category: 'directive',
        source: 'DNR',
      });
    }

    // 3. Anticoagulants
    const anticoagulantNames = ['warfarin', 'eliquis', 'apixaban', 'rivaroxaban', 'xarelto', 'heparin', 'enoxaparin'];
    const onAnticoagulant = patient.medications.some(m =>
      anticoagulantNames.some(a => m.name.toLowerCase().includes(a))
    );
    if (onAnticoagulant) {
      flags.push({
        text: 'BLEEDING RISK: Patient on anticoagulant therapy',
        severity: 'high',
        category: 'medication',
        source: 'Anticoagulant',
      });
    }

    // 4. Diabetes on insulin
    const hasDiabetes = patient.conditions.some(c =>
      c.status === 'active' && c.name.toLowerCase().includes('diabetes')
    );
    const onInsulin = patient.medications.some(m =>
      m.name.toLowerCase().includes('insulin')
    );
    if (hasDiabetes && onInsulin) {
      flags.push({
        text: 'DIABETIC EMERGENCY RISK: Monitor blood glucose closely',
        severity: 'high',
        category: 'condition',
        source: 'Diabetes + Insulin',
      });
    }

    // 5. Cardiac conditions
    const cardiacConditions = ['atrial fibrillation', 'a-fib', 'afib', 'heart failure', 'myocardial infarction', 'prior mi'];
    const hasCardiac = patient.conditions.some(c =>
      c.status === 'active' && cardiacConditions.some(cc => c.name.toLowerCase().includes(cc))
    );
    if (hasCardiac) {
      flags.push({
        text: 'CARDIAC RISK: Continuous monitoring recommended',
        severity: 'high',
        category: 'condition',
        source: 'Cardiac condition',
      });
    }

    // 6. Implants — MRI compatibility check
    for (const implant of patient.implants) {
      flags.push({
        text: `IMPLANT ALERT: ${implant.name} — MRI compatibility check required`,
        severity: 'moderate',
        category: 'implant',
        source: implant.name,
      });
    }

    // 7. Pregnancy
    if (patient.pregnancyStatus === 'confirmed' || patient.pregnancyStatus === 'possible' ||
        patient.conditions.some(c => c.status === 'active' && c.name.toLowerCase().includes('pregnancy'))) {
      flags.push({
        text: 'PREGNANCY PROTOCOL ACTIVE',
        severity: 'critical',
        category: 'condition',
        source: 'Pregnancy',
      });
    }

    // 8. Organ donor
    if (patient.organDonor) {
      flags.push({
        text: 'ORGAN DONOR — Notify procurement if applicable',
        severity: 'moderate',
        category: 'directive',
        source: 'Organ Donor',
      });
    }

    // 9. Polypharmacy
    if (patient.medications.length >= 5) {
      flags.push({
        text: `POLYPHARMACY RISK — ${patient.medications.length} medications; high interaction probability`,
        severity: 'high',
        category: 'medication',
        source: 'Polypharmacy',
      });
    }

    // 10. Recent surgery (within 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    for (const surgery of patient.surgeries) {
      const surgeryDate = new Date(surgery.date);
      if (surgeryDate > ninetyDaysAgo) {
        let alertText = `RECENT SURGERY: ${surgery.name} — Movement/medication precautions`;
        const name = surgery.name.toLowerCase();
        if (name.includes('spinal') || name.includes('spine') || name.includes('lumbar') || name.includes('cervical')) {
          alertText = `RECENT SURGERY: ${surgery.name} — Do not move without backboard`;
        } else if (name.includes('cardiac') || name.includes('cabg') || name.includes('sternotomy') || name.includes('bypass')) {
          alertText = `RECENT SURGERY: ${surgery.name} — Sternum precautions: no heavy lifting/pushing`;
        } else if (name.includes('joint') || name.includes('hip') || name.includes('knee') || name.includes('replacement')) {
          alertText = `RECENT SURGERY: ${surgery.name} — Fall prevention protocol`;
        } else if (name.includes('abdominal') || name.includes('laparotomy') || name.includes('appendec')) {
          alertText = `RECENT SURGERY: ${surgery.name} — Monitor for wound dehiscence`;
        }
        flags.push({
          text: alertText,
          severity: 'high',
          category: 'surgical',
          source: surgery.name,
        });
      }
    }

    // Psychiatric medication flag
    const psychiatricMeds = ['lithium', 'ssri', 'benzodiazepine', 'alprazolam', 'lorazepam', 'diazepam',
      'sertraline', 'fluoxetine', 'citalopram', 'escitalopram', 'paroxetine',
      'haloperidol', 'olanzapine', 'risperidone', 'quetiapine', 'aripiprazole',
      'valproic acid', 'valproate', 'lamotrigine'];
    const onPsychiatric = patient.medications.some(m =>
      psychiatricMeds.some(p => m.name.toLowerCase().includes(p))
    );
    if (onPsychiatric) {
      flags.push({
        text: 'PSYCHIATRIC MEDICATIONS ON BOARD — Special interaction considerations',
        severity: 'high',
        category: 'medication',
        source: 'Psychiatric Medications',
      });
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, moderate: 2 };
    flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Red flags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
