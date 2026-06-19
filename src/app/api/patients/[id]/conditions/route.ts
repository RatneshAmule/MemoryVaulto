import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, diagnosedDate, status, icdCode, cluster } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const condition = await db.condition.create({
      data: {
        patientId: id,
        name,
        diagnosedDate: diagnosedDate || null,
        status: status || 'active',
        icdCode: icdCode || null,
        cluster: cluster || null,
      },
    });

    return NextResponse.json({ condition }, { status: 201 });
  } catch (error) {
    console.error('Add condition error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
