import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; conditionId: string }> }
) {
  try {
    const { conditionId } = await params;
    await db.condition.delete({ where: { id: conditionId } });
    return NextResponse.json({ message: 'Condition removed' });
  } catch (error) {
    console.error('Delete condition error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
