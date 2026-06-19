import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, severity, reaction, crossReactivity, treatmentRequired, lastReactionDate } = await request.json();

    if (!name || !severity) {
      return NextResponse.json({ error: 'Name and severity are required' }, { status: 400 });
    }

    const allergy = await db.allergy.create({
      data: {
        patientId: id,
        name,
        severity,
        reaction: reaction || null,
        crossReactivity: crossReactivity || null,
        treatmentRequired: treatmentRequired || null,
        lastReactionDate: lastReactionDate || null,
      },
    });

    return NextResponse.json({ allergy }, { status: 201 });
  } catch (error) {
    console.error('Add allergy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
