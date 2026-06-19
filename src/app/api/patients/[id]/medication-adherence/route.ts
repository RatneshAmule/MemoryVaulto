import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const medicationAdherence = await db.medicationAdherence.findMany({
      where: { patientId: id },
      orderBy: { updatedDate: 'desc' },
    });
    return NextResponse.json({ medicationAdherence });
  } catch (error) {
    console.error('Get medication adherence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { medicationName, overallScore, lastRefillDate, missedDosesLast30Days, source, updatedDate } = await request.json();

    if (!medicationName || overallScore === undefined || !source || !updatedDate) {
      return NextResponse.json({ error: 'medicationName, overallScore, source, and updatedDate are required' }, { status: 400 });
    }

    const adherence = await db.medicationAdherence.create({
      data: {
        patientId: id,
        medicationName,
        overallScore: parseFloat(overallScore),
        lastRefillDate: lastRefillDate || null,
        missedDosesLast30Days: missedDosesLast30Days || null,
        source,
        updatedDate,
      },
    });

    return NextResponse.json({ medicationAdherence: adherence }, { status: 201 });
  } catch (error) {
    console.error('Add medication adherence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
