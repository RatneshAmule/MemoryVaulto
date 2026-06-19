import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const geneticFlags = await db.geneticFlag.findMany({
      where: { patientId: id },
    });
    return NextResponse.json({ geneticFlags });
  } catch (error) {
    console.error('Get genetic flags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { condition, gene, implications, medicationsToAvoid, safeAlternatives, familyScreening, verifiedDate } = await request.json();

    if (!condition || !implications) {
      return NextResponse.json({ error: 'Condition and implications are required' }, { status: 400 });
    }

    const flag = await db.geneticFlag.create({
      data: {
        patientId: id,
        condition,
        gene: gene || null,
        implications,
        medicationsToAvoid: medicationsToAvoid || '',
        safeAlternatives: safeAlternatives || '',
        familyScreening: familyScreening || false,
        verifiedDate: verifiedDate || null,
      },
    });

    return NextResponse.json({ geneticFlag: flag }, { status: 201 });
  } catch (error) {
    console.error('Add genetic flag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
