import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vitalId: string }> }
) {
  try {
    const { vitalId } = await params;
    const body = await request.json();

    const vital = await db.vitalBaseline.update({
      where: { id: vitalId },
      data: {
        vitalType: body.vitalType,
        value: body.value !== undefined ? parseFloat(body.value) : undefined,
        unit: body.unit,
        source: body.source,
        recordedDate: body.recordedDate,
      },
    });

    return NextResponse.json({ vitalBaseline: vital });
  } catch (error) {
    console.error('Update vital baseline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; vitalId: string }> }
) {
  try {
    const { vitalId } = await params;
    await db.vitalBaseline.delete({ where: { id: vitalId } });
    return NextResponse.json({ message: 'Vital baseline removed' });
  } catch (error) {
    console.error('Delete vital baseline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
