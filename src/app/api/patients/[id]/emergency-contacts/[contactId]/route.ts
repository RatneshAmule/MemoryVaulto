import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const { contactId } = await params;
    await db.emergencyContact.delete({ where: { id: contactId } });
    return NextResponse.json({ message: 'Emergency contact removed' });
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
