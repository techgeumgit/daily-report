import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';

// GET /api/users - list users (optionally filter by active status)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (onlyActive === 'true') query.isActive = true;

    const users = await User.find(query).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
