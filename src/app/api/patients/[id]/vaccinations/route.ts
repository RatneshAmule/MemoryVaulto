import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, date, status } = await request.json();

    if (!name || !date) {
      return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
    }

    const vaccination = await db.vaccination.create({
      data: { patientId: id, name, date, status: status || 'completed' },
    });

    return NextResponse.json({ vaccination }, { status: 201 });
  } catch (error) {
    console.error('Add vaccination error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
