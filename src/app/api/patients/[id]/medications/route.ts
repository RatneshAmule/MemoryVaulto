import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      name, dose, frequency, startDate, prescriber,
      category, isOpioid, isPsychMed, requiresMonitoring,
    } = await request.json();

    if (!name || !dose || !frequency) {
      return NextResponse.json({ error: 'Name, dose, and frequency are required' }, { status: 400 });
    }

    const medication = await db.medication.create({
      data: {
        patientId: id,
        name,
        dose,
        frequency,
        startDate: startDate || null,
        prescriber: prescriber || null,
        category: category || null,
        isOpioid: isOpioid || false,
        isPsychMed: isPsychMed || false,
        requiresMonitoring: requiresMonitoring || false,
      },
    });

    return NextResponse.json({ medication }, { status: 201 });
  } catch (error) {
    console.error('Add medication error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
