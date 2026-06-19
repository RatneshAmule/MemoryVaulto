import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pharmacogenomics = await db.pharmacogenomic.findMany({
      where: { patientId: id },
      orderBy: { gene: 'asc' },
    });
    return NextResponse.json({ pharmacogenomics });
  } catch (error) {
    console.error('Get pharmacogenomics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { gene, variant, implications, medications, verifiedDate } = await request.json();

    if (!gene || !variant || !implications) {
      return NextResponse.json({ error: 'Gene, variant, and implications are required' }, { status: 400 });
    }

    const pharma = await db.pharmacogenomic.create({
      data: {
        patientId: id,
        gene,
        variant,
        implications,
        medications: medications || null,
        verifiedDate: verifiedDate || null,
      },
    });

    return NextResponse.json({ pharmacogenomic: pharma }, { status: 201 });
  } catch (error) {
    console.error('Add pharmacogenomic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
