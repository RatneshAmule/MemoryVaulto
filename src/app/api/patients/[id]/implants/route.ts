import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, implantDate, manufacturer, serialNumber } = await request.json();

    if (!name || !implantDate) {
      return NextResponse.json({ error: 'Name and implant date are required' }, { status: 400 });
    }

    const implant = await db.implant.create({
      data: { patientId: id, name, implantDate, manufacturer: manufacturer || null, serialNumber: serialNumber || null },
    });

    return NextResponse.json({ implant }, { status: 201 });
  } catch (error) {
    console.error('Add implant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
