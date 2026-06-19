import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; surgeryId: string }> }
) {
  try {
    const { surgeryId } = await params;
    await db.surgery.delete({ where: { id: surgeryId } });
    return NextResponse.json({ message: 'Surgery removed' });
  } catch (error) {
    console.error('Delete surgery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
