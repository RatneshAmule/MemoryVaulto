import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; allergyId: string }> }
) {
  try {
    const { allergyId } = await params;
    await db.allergy.delete({ where: { id: allergyId } });
    return NextResponse.json({ message: 'Allergy removed' });
  } catch (error) {
    console.error('Delete allergy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
