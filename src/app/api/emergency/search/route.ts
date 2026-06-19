import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const bloodType = searchParams.get('bloodType');

    if (!name && !bloodType) {
      return NextResponse.json({ error: 'Search by name or bloodType is required' }, { status: 400 });
    }

    // SQLite doesn't support mode: 'insensitive', so use contains and filter manually
    const allPatients = await db.patient.findMany({
      where: {
        ...(bloodType ? { bloodType } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    let patients = allPatients;
    if (name) {
      const nameLower = name.toLowerCase();
      patients = patients.filter(
        (p) => p.user?.name?.toLowerCase().includes(nameLower)
      );
    }
    patients = patients.slice(0, 20);

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Emergency search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
