import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId, drugName } = await request.json();

    if (!patientId || !drugName) {
      return NextResponse.json({ error: 'patientId and drugName are required' }, { status: 400 });
    }

    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true,
        conditions: true,
        medications: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // SQLite doesn't support mode: 'insensitive', so get all rules and filter manually
    const allRules = await db.drugInteractionRule.findMany();
    const rules = allRules.filter(
      (r) => r.drugName.toLowerCase() === drugName.toLowerCase()
    );

    const interactions: Array<{
      drug: string;
      contraindication: string;
      type: string;
      severity: string;
      description: string;
    }> = [];

    for (const rule of rules) {
      let matched = false;

      if (rule.type === 'allergy') {
        matched = patient.allergies.some(
          (a) => a.name.toLowerCase().includes(rule.contraindication.toLowerCase()) ||
                 rule.contraindication.toLowerCase().includes(a.name.toLowerCase())
        );
      } else if (rule.type === 'condition') {
        matched = patient.conditions.some(
          (c) => c.name.toLowerCase().includes(rule.contraindication.toLowerCase()) ||
                 rule.contraindication.toLowerCase().includes(c.name.toLowerCase())
        );
      } else if (rule.type === 'medication') {
        matched = patient.medications.some(
          (m) => m.name.toLowerCase().includes(rule.contraindication.toLowerCase()) ||
                 rule.contraindication.toLowerCase().includes(m.name.toLowerCase())
        );
      }

      if (matched) {
        interactions.push({
          drug: rule.drugName,
          contraindication: rule.contraindication,
          type: rule.type,
          severity: rule.severity,
          description: rule.description,
        });
      }
    }

    // Pregnancy-aware drug checking
    const isPregnant = patient.pregnancyStatus === 'confirmed' || patient.pregnancyStatus === 'possible' ||
      patient.conditions.some(c => c.status === 'active' && c.name.toLowerCase().includes('pregnancy'));

    if (isPregnant) {
      // Check if pregnancy rules already matched
      const pregnancyAlreadyMatched = interactions.some(
        (i) => i.contraindication.toLowerCase() === 'pregnancy'
      );

      if (!pregnancyAlreadyMatched) {
        // Check pregnancy-specific drug rules that didn't match through condition
        const pregnancyRules = allRules.filter(
          (r) => r.contraindication.toLowerCase() === 'pregnancy' &&
                 r.drugName.toLowerCase() === drugName.toLowerCase()
        );
        for (const rule of pregnancyRules) {
          interactions.push({
            drug: rule.drugName,
            contraindication: 'Pregnancy',
            type: 'condition',
            severity: rule.severity,
            description: rule.description,
          });
        }
      }
    }

    const isDuplicate = patient.medications.some(
      (m) => m.name.toLowerCase() === drugName.toLowerCase()
    );

    if (isDuplicate) {
      const alreadyFlagged = interactions.some(
        (i) => i.type === 'medication' && i.contraindication.toLowerCase() === drugName.toLowerCase()
      );
      if (!alreadyFlagged) {
        interactions.push({
          drug: drugName,
          contraindication: drugName,
          type: 'medication',
          severity: 'warning',
          description: `Patient is already prescribed ${drugName}. Duplicate therapy may increase risk of adverse effects.`,
        });
      }
    }

    const hasDanger = interactions.some((i) => i.severity === 'danger');
    const safe = interactions.length === 0;

    // Add pregnancy flag
    const pregnancyAlert = isPregnant ? {
      status: patient.pregnancyStatus,
      message: patient.pregnancyStatus === 'confirmed'
        ? 'PREGNANCY CONFIRMED — Pregnancy-safe protocols active'
        : 'PREGNANCY POSSIBLE — Exercise caution with medication selection',
    } : null;

    return NextResponse.json({ safe, hasDanger, interactions, pregnancyAlert });
  } catch (error) {
    console.error('Drug check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
