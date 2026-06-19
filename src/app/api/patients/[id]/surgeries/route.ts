import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, date, hospital, notes } = await request.json();

    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    const surgery = await db.surgery.create({
      data: { patientId: id, name, date, hospital: hospital || null, notes: notes || null },
    });

    return NextResponse.json({ surgery }, { status: 201 });
  } catch (error) {
    console.error('Add surgery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
