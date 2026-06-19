import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const culturalDirectives = await db.culturalDirective.findMany({
      where: { patientId: id },
    });
    return NextResponse.json({ culturalDirectives });
  } catch (error) {
    console.error('Get cultural directives error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { religion, directive, description, overrideAllowed, verifiedBy } = await request.json();

    if (!religion || !directive || !description) {
      return NextResponse.json({ error: 'Religion, directive, and description are required' }, { status: 400 });
    }

    const cd = await db.culturalDirective.create({
      data: {
        patientId: id,
        religion,
        directive,
        description,
        overrideAllowed: overrideAllowed || false,
        verifiedBy: verifiedBy || null,
      },
    });

    return NextResponse.json({ culturalDirective: cd }, { status: 201 });
  } catch (error) {
    console.error('Add cultural directive error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
