import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RedFlag {
  text: string;
  severity: 'critical' | 'high' | 'moderate';
  category: string;
  source: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true,
        medications: true,
        conditions: true,
        surgeries: true,
        implants: true,
        pharmacogenomics: true,
        geneticFlags: true,
        culturalDirectives: true,
        advanceDirectives: { where: { isActive: true } },
        bloodAntibodies: true,
        painProfile: true,
        deviceIntegrations: { where: { isActive: true } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const flags: RedFlag[] = [];

    // 1. Severe allergies
    for (const allergy of patient.allergies) {
      if (allergy.severity === 'severe' || allergy.severity === 'life-threatening') {
        flags.push({
          text: `${allergy.severity.toUpperCase()} ALLERGY: ${allergy.name}${allergy.reaction ? ` — ${allergy.reaction}` : ''}`,
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

    // 6. Implants
    for (const implant of patient.implants) {
      if (!implant.mriSafe) {
        flags.push({
          text: `IMPLANT ALERT: ${implant.name} — MRI CONTRAINDICATED`,
          severity: 'critical',
          category: 'implant',
          source: implant.name,
        });
      } else {
        flags.push({
          text: `IMPLANT: ${implant.name} — MRI compatibility check required`,
          severity: 'moderate',
          category: 'implant',
          source: implant.name,
        });
      }
    }

    // 7. Pregnancy
    if (patient.pregnancyStatus === 'confirmed' || patient.pregnancyStatus === 'possible') {
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

    // 10. Recent surgery
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    for (const surgery of patient.surgeries) {
      const surgeryDate = new Date(surgery.date);
      if (surgeryDate > ninetyDaysAgo) {
        flags.push({
          text: `RECENT SURGERY: ${surgery.name} — Movement/medication precautions`,
          severity: 'high',
          category: 'surgical',
          source: surgery.name,
        });
      }
    }

    // 11. Psychiatric medications
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

    // 12. Genetic flags
    for (const flag of patient.geneticFlags) {
      flags.push({
        text: `GENETIC FLAG: ${flag.condition} — ${flag.implications}`,
        severity: 'critical',
        category: 'genetic',
        source: flag.condition,
      });
    }

    // 13. Pharmacogenomic warnings
    for (const pharma of patient.pharmacogenomics) {
      if (pharma.variant === 'poor-metabolizer' || pharma.variant === 'ultra-rapid') {
        flags.push({
          text: `PHARMACOGENOMIC: ${pharma.gene} ${pharma.variant} — ${pharma.implications}`,
          severity: 'high',
          category: 'pharmacogenomic',
          source: pharma.gene,
        });
      }
    }

    // 14. Blood antibodies
    if (patient.bloodAntibodies.length > 0) {
      for (const ab of patient.bloodAntibodies) {
        if (ab.significance === 'clinically-significant') {
          flags.push({
            text: `BLOOD ANTIBODY: ${ab.antibody} (${ab.antibodyType}) — Type-specific blood required`,
            severity: 'high',
            category: 'blood',
            source: ab.antibody,
          });
        }
      }
    }

    // 15. Cultural directives that cannot be overridden
    for (const cd of patient.culturalDirectives) {
      if (!cd.overrideAllowed) {
        flags.push({
          text: `CULTURAL DIRECTIVE: ${cd.directive} (${cd.religion}) — Cannot be overridden`,
          severity: 'high',
          category: 'cultural',
          source: cd.directive,
        });
      }
    }

    // 16. Advance directives
    for (const ad of patient.advanceDirectives) {
      flags.push({
        text: `ADVANCE DIRECTIVE: ${ad.directiveType} — ${ad.description}`,
        severity: ad.directiveType === 'dnr' || ad.directiveType === 'dni' ? 'critical' : 'high',
        category: 'directive',
        source: ad.directiveType,
      });
    }

    // 17. Opioid risk
    if (patient.painProfile) {
      if (patient.painProfile.opioidTolerance === 'high' || patient.painProfile.opioidUseDisorderHistory === 'active') {
        flags.push({
          text: `OPIOID RISK: Tolerance ${patient.painProfile.opioidTolerance}, OUD: ${patient.painProfile.opioidUseDisorderHistory}`,
          severity: 'high',
          category: 'pain',
          source: 'Pain Profile',
        });
      }
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
