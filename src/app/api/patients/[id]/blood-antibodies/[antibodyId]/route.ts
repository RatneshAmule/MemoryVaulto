import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; antibodyId: string }> }
) {
  try {
    const { antibodyId } = await params;
    await db.bloodAntibody.delete({ where: { id: antibodyId } });
    return NextResponse.json({ message: 'Blood antibody removed' });
  } catch (error) {
    console.error('Delete blood antibody error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
