import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface PediatricDoseResult {
  isPediatric: boolean;
  age: number;
  weight: number | null;
  drugName: string;
  dosePerKg: string;
  calculatedDose: string;
  maxDose: string;
  adjustedDose: string;
  warning?: string;
}

const DOSING_RULES: Record<string, { dosePerKg: number; maxDose: number; unit: string }> = {
  'acetaminophen': { dosePerKg: 15, maxDose: 650, unit: 'mg' },
  'ibuprofen': { dosePerKg: 10, maxDose: 400, unit: 'mg' },
  'amoxicillin': { dosePerKg: 25, maxDose: 500, unit: 'mg' },
  'epinephrine': { dosePerKg: 0.01, maxDose: 0.5, unit: 'mg' },
  'diphenhydramine': { dosePerKg: 1, maxDose: 50, unit: 'mg' },
  'albuterol': { dosePerKg: 0.15, maxDose: 5, unit: 'mg' },
  'morphine': { dosePerKg: 0.1, maxDose: 10, unit: 'mg' },
  'lorazepam': { dosePerKg: 0.05, maxDose: 2, unit: 'mg' },
  'diazepam': { dosePerKg: 0.2, maxDose: 10, unit: 'mg' },
  'fentanyl': { dosePerKg: 1, maxDose: 100, unit: 'mcg' },
  'ceftriaxone': { dosePerKg: 50, maxDose: 2000, unit: 'mg' },
  'azithromycin': { dosePerKg: 10, maxDose: 500, unit: 'mg' },
  'prednisolone': { dosePerKg: 1, maxDose: 60, unit: 'mg' },
  'valproic acid': { dosePerKg: 10, maxDose: 250, unit: 'mg' },
};

export async function GET(request: NextRequest) {
  try {
    const patientId = request.nextUrl.searchParams.get('patientId');
    const drugName = request.nextUrl.searchParams.get('drugName');
    if (!patientId || !drugName) {
      return NextResponse.json({ error: 'patientId and drugName are required' }, { status: 400 });
    }

    const patient = await db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const dob = new Date(patient.dateOfBirth);
    const ageInMs = Date.now() - dob.getTime();
    const age = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));

    if (age >= 18) {
      return NextResponse.json({
        isPediatric: false,
        age,
        weight: patient.weight,
        drugName,
        dosePerKg: 'N/A',
        calculatedDose: 'N/A',
        maxDose: 'N/A',
        adjustedDose: 'N/A',
        warning: 'Patient is not pediatric. Standard adult dosing applies.',
      });
    }

    if (!patient.weight) {
      return NextResponse.json({
        isPediatric: true,
        age,
        weight: null,
        drugName,
        dosePerKg: 'Unknown',
        calculatedDose: 'Cannot calculate',
        maxDose: 'Unknown',
        adjustedDose: 'Cannot calculate',
        warning: 'Weight required for dose calculation. Enter patient weight in profile.',
      });
    }

    const weight = patient.weight;
    const drugKey = drugName.toLowerCase();
    const rule = DOSING_RULES[drugKey];

    if (!rule) {
      const result: PediatricDoseResult = {
        isPediatric: true,
        age,
        weight,
        drugName,
        dosePerKg: 'Unknown',
        calculatedDose: 'Cannot calculate',
        maxDose: 'N/A',
        adjustedDose: 'Cannot calculate',
        warning: 'Consult pediatric dosing reference for this medication. No auto-dosing rule available.',
      };
      return NextResponse.json(result);
    }

    const calculatedDose = rule.dosePerKg * weight;
    const adjustedDose = Math.min(calculatedDose, rule.maxDose);
    const capped = calculatedDose > rule.maxDose;

    const result: PediatricDoseResult = {
      isPediatric: true,
      age,
      weight,
      drugName,
      dosePerKg: `${rule.dosePerKg} ${rule.unit}/kg/dose`,
      calculatedDose: `${calculatedDose.toFixed(1)} ${rule.unit}`,
      maxDose: `${rule.maxDose} ${rule.unit}`,
      adjustedDose: `${adjustedDose.toFixed(1)} ${rule.unit}`,
      warning: capped
        ? `Calculated dose exceeds maximum. Dose capped at ${rule.maxDose} ${rule.unit}.`
        : undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Pediatric dosing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
