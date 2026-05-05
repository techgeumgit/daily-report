import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Report from '@/models/Report';
import { isAdmin } from '@/lib/auth';

// POST /api/admin/reports - admin create (no 48h restriction, any date)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { date, name, todaysWork, meetingAttended, bottleneck, tomorrowPlan } = body;

    if (!name || !todaysWork || !tomorrowPlan || !meetingAttended || !bottleneck) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const report = await Report.create({
      date: date ? new Date(date) : new Date(),
      name: name.trim(),
      todaysWork: todaysWork.trim(),
      meetingAttended: meetingAttended?.trim() || '',
      bottleneck: bottleneck?.trim() || '',
      tomorrowPlan: tomorrowPlan.trim(),
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
