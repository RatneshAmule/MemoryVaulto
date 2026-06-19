import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; exposureId: string }> }
) {
  try {
    const { exposureId } = await params;
    await db.radiationExposure.delete({ where: { id: exposureId } });
    return NextResponse.json({ message: 'Radiation exposure removed' });
  } catch (error) {
    console.error('Delete radiation exposure error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
