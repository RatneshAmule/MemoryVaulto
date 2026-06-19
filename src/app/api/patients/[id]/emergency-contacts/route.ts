import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, relationship, phone, email, priority } = await request.json();

    if (!name || !relationship || !phone) {
      return NextResponse.json({ error: 'Name, relationship, and phone are required' }, { status: 400 });
    }

    const contact = await db.emergencyContact.create({
      data: { patientId: id, name, relationship, phone, email: email || null, priority: priority || 1 },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Add emergency contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
