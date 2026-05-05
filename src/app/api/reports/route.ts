import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Report from '@/models/Report';

// GET /api/reports - fetch with optional filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const name = searchParams.get('name');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Include the full end day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    const reports = await Report.find(query).sort({ date: -1 }).lean();

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/reports - create a new report (employee submission with 48h validation)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { date, name, todaysWork, meetingAttended, bottleneck, tomorrowPlan } = body;

    // 48-hour server-side validation
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    const submittedDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - submittedDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 48 || diffMs < 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid date. Reports can only be submitted for today or yesterday (within 48 hours).',
        },
        { status: 400 }
      );
    }

    if (!name || !todaysWork || !tomorrowPlan) {
      return NextResponse.json(
        { success: false, error: 'Name, today\'s work, and tomorrow\'s plan are required.' },
        { status: 400 }
      );
    }

    // Check for existing report on the same date
    const startOfDay = new Date(submittedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(submittedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingReport = await Report.findOne({
      name: name.trim(),
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a report for this date.' },
        { status: 409 }
      );
    }

    const report = await Report.create({
      date: submittedDate,
      name: name.trim(),
      todaysWork: todaysWork.trim(),
      meetingAttended: meetingAttended?.trim() || '',
      bottleneck: bottleneck?.trim() || '',
      tomorrowPlan: tomorrowPlan.trim(),
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
