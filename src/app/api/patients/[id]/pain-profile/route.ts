import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const painProfile = await db.painProfile.findUnique({
      where: { patientId: id },
    });

    if (!painProfile) {
      return NextResponse.json({ painProfile: null });
    }

    return NextResponse.json({ painProfile });
  } catch (error) {
    console.error('Get pain profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = {
      chronicPainConditions: body.chronicPainConditions,
      currentPainPlan: body.currentPainPlan,
      opioidTolerance: body.opioidTolerance,
      opioidUseDisorderHistory: body.opioidUseDisorderHistory,
      effectiveMedications: body.effectiveMedications,
      ineffectiveMedications: body.ineffectiveMedications,
      painMedAllergies: body.painMedAllergies,
      sickleCellStatus: body.sickleCellStatus,
      mmeDailyDose: body.mmeDailyDose !== undefined ? parseFloat(body.mmeDailyDose) : undefined,
      naloxonePrescribed: body.naloxonePrescribed,
      painManagementDoctor: body.painManagementDoctor,
    };

    // Upsert: create if doesn't exist, update if it does
    const painProfile = await db.painProfile.upsert({
      where: { patientId: id },
      update: data,
      create: {
        patientId: id,
        chronicPainConditions: body.chronicPainConditions || '',
        currentPainPlan: body.currentPainPlan || '',
        opioidTolerance: body.opioidTolerance || 'naive',
        opioidUseDisorderHistory: body.opioidUseDisorderHistory || 'none',
        effectiveMedications: body.effectiveMedications || '',
        ineffectiveMedications: body.ineffectiveMedications || '',
        painMedAllergies: body.painMedAllergies || '',
        sickleCellStatus: body.sickleCellStatus || false,
        mmeDailyDose: body.mmeDailyDose !== undefined ? parseFloat(body.mmeDailyDose) : null,
        naloxonePrescribed: body.naloxonePrescribed || false,
        painManagementDoctor: body.painManagementDoctor || null,
      },
    });

    return NextResponse.json({ painProfile });
  } catch (error) {
    console.error('Update pain profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
