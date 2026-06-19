import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; adherenceId: string }> }
) {
  try {
    const { adherenceId } = await params;
    const body = await request.json();

    const adherence = await db.medicationAdherence.update({
      where: { id: adherenceId },
      data: {
        medicationName: body.medicationName,
        overallScore: body.overallScore !== undefined ? parseFloat(body.overallScore) : undefined,
        lastRefillDate: body.lastRefillDate,
        missedDosesLast30Days: body.missedDosesLast30Days,
        source: body.source,
        updatedDate: body.updatedDate,
      },
    });

    return NextResponse.json({ medicationAdherence: adherence });
  } catch (error) {
    console.error('Update medication adherence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; adherenceId: string }> }
) {
  try {
    const { adherenceId } = await params;
    await db.medicationAdherence.delete({ where: { id: adherenceId } });
    return NextResponse.json({ message: 'Medication adherence record removed' });
  } catch (error) {
    console.error('Delete medication adherence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
