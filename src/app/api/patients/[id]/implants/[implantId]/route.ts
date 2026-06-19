import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; implantId: string }> }
) {
  try {
    const { implantId } = await params;
    await db.implant.delete({ where: { id: implantId } });
    return NextResponse.json({ message: 'Implant removed' });
  } catch (error) {
    console.error('Delete implant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
