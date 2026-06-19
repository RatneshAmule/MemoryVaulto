import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const radiationExposures = await db.radiationExposure.findMany({
      where: { patientId: id },
      orderBy: { studyDate: 'desc' },
    });
    return NextResponse.json({ radiationExposures });
  } catch (error) {
    console.error('Get radiation exposures error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { source, bodyRegion, doseMSv, studyDate, facility, cumulativeTotal } = await request.json();

    if (!source || !bodyRegion || doseMSv === undefined || !studyDate) {
      return NextResponse.json({ error: 'source, bodyRegion, doseMSv, and studyDate are required' }, { status: 400 });
    }

    const exposure = await db.radiationExposure.create({
      data: {
        patientId: id,
        source,
        bodyRegion,
        doseMSv: parseFloat(doseMSv),
        studyDate,
        facility: facility || null,
        cumulativeTotal: cumulativeTotal !== undefined ? parseFloat(cumulativeTotal) : null,
      },
    });

    return NextResponse.json({ radiationExposure: exposure }, { status: 201 });
  } catch (error) {
    console.error('Add radiation exposure error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
