import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; medicationId: string }> }
) {
  try {
    const { medicationId } = await params;
    await db.medication.delete({ where: { id: medicationId } });
    return NextResponse.json({ message: 'Medication removed' });
  } catch (error) {
    console.error('Delete medication error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
