import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; testId: string }> }
) {
  try {
    const { testId } = await params;
    const body = await request.json();

    const test = await db.medicalTest.update({
      where: { id: testId },
      data: {
        testName: body.testName,
        facility: body.facility,
        results: body.results,
        orderingDoc: body.orderingDoc,
        status: body.status,
        radiationDose: body.radiationDose !== undefined ? parseFloat(body.radiationDose) : undefined,
        bodyRegion: body.bodyRegion,
      },
    });

    return NextResponse.json({ test });
  } catch (error) {
    console.error('Update medical test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; testId: string }> }
) {
  try {
    const { testId } = await params;
    await db.medicalTest.delete({ where: { id: testId } });
    return NextResponse.json({ message: 'Medical test removed' });
  } catch (error) {
    console.error('Delete medical test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
