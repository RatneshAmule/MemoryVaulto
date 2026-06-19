import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vitalBaselines = await db.vitalBaseline.findMany({
      where: { patientId: id },
      orderBy: { recordedDate: 'desc' },
    });
    return NextResponse.json({ vitalBaselines });
  } catch (error) {
    console.error('Get vital baselines error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { vitalType, value, unit, source, recordedDate } = await request.json();

    if (!vitalType || value === undefined || !unit || !recordedDate) {
      return NextResponse.json({ error: 'vitalType, value, unit, and recordedDate are required' }, { status: 400 });
    }

    const vital = await db.vitalBaseline.create({
      data: {
        patientId: id,
        vitalType,
        value: parseFloat(value),
        unit,
        source: source || 'routine-visit',
        recordedDate,
      },
    });

    return NextResponse.json({ vitalBaseline: vital }, { status: 201 });
  } catch (error) {
    console.error('Add vital baseline error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
