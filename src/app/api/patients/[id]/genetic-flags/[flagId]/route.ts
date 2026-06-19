import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; flagId: string }> }
) {
  try {
    const { flagId } = await params;
    const body = await request.json();

    const flag = await db.geneticFlag.update({
      where: { id: flagId },
      data: {
        condition: body.condition,
        gene: body.gene,
        implications: body.implications,
        medicationsToAvoid: body.medicationsToAvoid,
        safeAlternatives: body.safeAlternatives,
        familyScreening: body.familyScreening,
        verifiedDate: body.verifiedDate,
      },
    });

    return NextResponse.json({ geneticFlag: flag });
  } catch (error) {
    console.error('Update genetic flag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; flagId: string }> }
) {
  try {
    const { flagId } = await params;
    await db.geneticFlag.delete({ where: { id: flagId } });
    return NextResponse.json({ message: 'Genetic flag removed' });
  } catch (error) {
    console.error('Delete genetic flag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
