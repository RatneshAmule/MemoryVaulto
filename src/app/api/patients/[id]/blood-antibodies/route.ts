import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bloodAntibodies = await db.bloodAntibody.findMany({
      where: { patientId: id },
      orderBy: { detectedDate: 'desc' },
    });
    return NextResponse.json({ bloodAntibodies });
  } catch (error) {
    console.error('Get blood antibodies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { antibody, antibodyType, detectedDate, significance } = await request.json();

    if (!antibody || !antibodyType || !detectedDate) {
      return NextResponse.json({ error: 'Antibody, antibodyType, and detectedDate are required' }, { status: 400 });
    }

    const bloodAb = await db.bloodAntibody.create({
      data: {
        patientId: id,
        antibody,
        antibodyType,
        detectedDate,
        significance: significance || 'clinically-significant',
      },
    });

    return NextResponse.json({ bloodAntibody: bloodAb }, { status: 201 });
  } catch (error) {
    console.error('Add blood antibody error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
