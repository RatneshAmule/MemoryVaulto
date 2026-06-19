import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; vaccinationId: string }> }
) {
  try {
    const { vaccinationId } = await params;
    await db.vaccination.delete({ where: { id: vaccinationId } });
    return NextResponse.json({ message: 'Vaccination removed' });
  } catch (error) {
    console.error('Delete vaccination error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
