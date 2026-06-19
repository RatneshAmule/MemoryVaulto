import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId, plannedTreatments } = await request.json();
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true, medications: true, conditions: true, implants: true,
        pharmacogenomics: true, geneticFlags: true, culturalDirectives: true,
        bloodAntibodies: true,
      }
    });

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const conflicts: { treatment: string; type: string; severity: string; description: string; alternative: string }[] = [];

    for (const treatment of (plannedTreatments || [])) {
      const t = (treatment || '').toLowerCase();

      // Check allergies
      for (const allergy of patient.allergies) {
        const allergen = allergy.name.toLowerCase();
        if (t.includes(allergen) || allergen.includes(t)) {
          conflicts.push({
            treatment, type: 'allergy', severity: allergy.severity === 'life-threatening' || allergy.severity === 'severe' ? 'BLACK' : 'RED',
            description: `STOP: Patient is allergic to ${allergy.name} (${allergy.severity}). Reaction: ${allergy.reaction || 'unknown'}. ${allergy.crossReactivity ? `Cross-reactivity: ${allergy.crossReactivity}` : ''}`,
            alternative: allergy.severity === 'life-threatening' || allergy.severity === 'severe' ? 'MUST use alternative — see drug interaction rules' : 'Use with extreme caution, have rescue meds ready'
          });
        }
        // Cross-reactivity check
        if (allergy.crossReactivity) {
          const cross = allergy.crossReactivity.toLowerCase().split(',');
          for (const c of cross) {
            if (t.includes(c.trim()) || c.trim().includes(t)) {
              conflicts.push({
                treatment, type: 'allergy-cross-reactivity', severity: 'RED',
                description: `CAUTION: ${treatment} cross-reacts with patient's allergy to ${allergy.name}. Risk of similar reaction.`,
                alternative: 'Consider alternative with lower cross-reactivity risk'
              });
            }
          }
        }
      }

      // Check drug interactions
      const interactionRules = await db.drugInteractionRule.findMany();
      for (const rule of interactionRules) {
        const drug = rule.drugName.toLowerCase();
        const contra = rule.contraindication.toLowerCase();
        if (t.includes(drug) || drug.includes(t)) {
          // Check if patient has the contraindication
          const hasMed = patient.medications.some(m => m.name.toLowerCase().includes(contra) || contra.includes(m.name.toLowerCase()));
          const hasAllergy = patient.allergies.some(a => a.name.toLowerCase().includes(contra) || contra.includes(a.name.toLowerCase()));
          const hasCondition = patient.conditions.some(c => c.name.toLowerCase().includes(contra) || contra.includes(c.name.toLowerCase()));
          const hasGenetic = patient.pharmacogenomics.some(p => `${p.gene} ${p.variant}`.toLowerCase().includes(contra));
          const hasGenFlag = patient.geneticFlags.some(g => g.condition.toLowerCase().includes(contra) || g.medicationsToAvoid?.toLowerCase().includes(t));

          if (hasMed || hasAllergy || hasCondition || hasGenetic || hasGenFlag) {
            conflicts.push({
              treatment, type: rule.type, severity: rule.severity === 'danger' ? 'RED' : rule.severity === 'warning' ? 'YELLOW' : 'CAUTION',
              description: `${rule.description}. Conflict: ${rule.drugName} ↔ ${rule.contraindication}`,
              alternative: rule.alternative || 'Consult pharmacist'
            });
          }
        }
        // Also check reverse: planned treatment is the contraindication
        if (t.includes(contra) || contra.includes(t)) {
          const hasMed = patient.medications.some(m => m.name.toLowerCase().includes(drug) || drug.includes(m.name.toLowerCase()));
          if (hasMed) {
            conflicts.push({
              treatment, type: rule.type, severity: rule.severity === 'danger' ? 'RED' : 'YELLOW',
              description: `${rule.description}. Patient is on ${rule.drugName}.`,
              alternative: rule.alternative || 'Consult pharmacist'
            });
          }
        }
      }

      // Check genetic flags
      for (const flag of patient.geneticFlags) {
        const avoid = (flag.medicationsToAvoid || '').toLowerCase().split(',');
        if (avoid.some(a => t.includes(a.trim()) || a.trim().includes(t))) {
          conflicts.push({
            treatment, type: 'genetic', severity: 'BLACK',
            description: `GENETIC DANGER: Patient has ${flag.condition}. ${treatment} is CONTRAINDICATED. ${flag.implications}`,
            alternative: flag.safeAlternatives || 'Consult specialist'
          });
        }
      }

      // Check pharmacogenomics
      for (const pg of patient.pharmacogenomics) {
        const affected = (pg.medications || '').toLowerCase().split(',');
        if (affected.some(a => t.includes(a.trim()) || a.trim().includes(t))) {
          conflicts.push({
            treatment, type: 'pharmacogenomic', severity: 'YELLOW',
            description: `PHARMACOGENOMIC ALERT: Patient is ${pg.variant} for ${pg.gene}. ${pg.implications}`,
            alternative: 'Dose adjustment or alternative medication may be needed'
          });
        }
      }

      // Check implant/MRI safety
      if (t.includes('mri') || t.includes('magnetic')) {
        for (const implant of patient.implants) {
          if (!implant.mriSafe) {
            conflicts.push({
              treatment, type: 'implant', severity: 'RED',
              description: `MRI CONTRAINDICATED: Patient has ${implant.name} at ${implant.bodyLocation} which is NOT MRI-safe.`,
              alternative: 'CT scan or ultrasound. Consult radiology.'
            });
          }
        }
      }

      // Check cultural directives
      for (const cd of patient.culturalDirectives) {
        if (cd.directive === 'no-blood-products' && (t.includes('transfusion') || t.includes('blood') || t.includes('packed cells'))) {
          conflicts.push({
            treatment, type: 'cultural-religious', severity: 'RED',
            description: `RELIGIOUS DIRECTIVE: Patient is ${cd.religion}. ${cd.description}. This override is NOT allowed.`,
            alternative: 'Blood conservation strategies: cell salvage, erythropoietin, iron supplements, volume expanders'
          });
        }
      }

      // Check pregnancy
      if (patient.pregnancyStatus === 'confirmed' || patient.pregnancyStatus === 'possible') {
        const teratogenicMeds = ['nsaid', 'warfarin', 'lisinopril', 'valproic acid', 'ace inhibitor', 'statin', 'methotrexate', 'isotretinoin'];
        if (teratogenicMeds.some(m => t.includes(m))) {
          conflicts.push({
            treatment, type: 'pregnancy', severity: 'RED',
            description: `PREGNANCY ALERT: Patient pregnancy status is "${patient.pregnancyStatus}". ${treatment} may be teratogenic.`,
            alternative: 'Use pregnancy-safe alternatives. Consult OB/GYN.'
          });
        }
        if (t.includes('ct') || t.includes('x-ray') || t.includes('radiation')) {
          conflicts.push({
            treatment, type: 'pregnancy', severity: 'YELLOW',
            description: `PREGNANCY ALERT: Patient pregnancy status is "${patient.pregnancyStatus}". Radiation exposure risk to fetus.`,
            alternative: 'Shield abdomen. Consider MRI/Ultrasound. If CT necessary, use lowest dose protocol.'
          });
        }
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueConflicts = conflicts.filter(c => {
      const key = `${c.treatment}-${c.type}-${c.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by severity
    const severityOrder: Record<string, number> = { BLACK: 0, RED: 1, YELLOW: 2, CAUTION: 3 };
    uniqueConflicts.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

    return NextResponse.json({
      patientId,
      plannedTreatments,
      conflicts: uniqueConflicts,
      safeToProceed: !uniqueConflicts.some(c => c.severity === 'BLACK' || c.severity === 'RED'),
      totalConflicts: uniqueConflicts.length,
      criticalConflicts: uniqueConflicts.filter(c => c.severity === 'BLACK' || c.severity === 'RED').length,
    });
  } catch (error) {
    console.error('Treatment firewall error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
