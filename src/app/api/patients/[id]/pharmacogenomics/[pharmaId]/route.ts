import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pharmaId: string }> }
) {
  try {
    const { pharmaId } = await params;
    const body = await request.json();

    const pharma = await db.pharmacogenomic.update({
      where: { id: pharmaId },
      data: {
        gene: body.gene,
        variant: body.variant,
        implications: body.implications,
        medications: body.medications,
        verifiedDate: body.verifiedDate,
      },
    });

    return NextResponse.json({ pharmacogenomic: pharma });
  } catch (error) {
    console.error('Update pharmacogenomic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pharmaId: string }> }
) {
  try {
    const { pharmaId } = await params;
    await db.pharmacogenomic.delete({ where: { id: pharmaId } });
    return NextResponse.json({ message: 'Pharmacogenomic record removed' });
  } catch (error) {
    console.error('Delete pharmacogenomic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
