import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const occupationalExposures = await db.occupationalExposure.findMany({
      where: { patientId: id },
    });
    return NextResponse.json({ occupationalExposures });
  } catch (error) {
    console.error('Get occupational exposures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workplace, hazardType, specificAgent, exposureLevel, msdsReference, lastExposure, ppeRequired } = await request.json();

    if (!workplace || !hazardType) {
      return NextResponse.json({ error: 'Workplace and hazardType are required' }, { status: 400 });
    }

    const exposure = await db.occupationalExposure.create({
      data: {
        patientId: id,
        workplace,
        hazardType,
        specificAgent: specificAgent || null,
        exposureLevel: exposureLevel || null,
        msdsReference: msdsReference || null,
        lastExposure: lastExposure || null,
        ppeRequired: ppeRequired || null,
      },
    });

    return NextResponse.json({ occupationalExposure: exposure }, { status: 201 });
  } catch (error) {
    console.error('Add occupational exposure error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
