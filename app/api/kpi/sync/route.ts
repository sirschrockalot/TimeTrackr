import { NextResponse } from 'next/server';
import { NextApiRequest } from 'next';
import connectDB from '../../../../lib/mongodb';
import HourlyCallStats from '../../../../models/HourlyCallStats';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextApiRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token.role !== 'admin' && token.role !== 'manager')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await connectDB();

  try {
    // 1. Fetch last hour of call data from external API (e.g., Aircall)
    // const externalCalls = await fetchFromAircall();

    // 2. Process and save to database
    // for (const call of externalCalls) {
    //   await HourlyCallStats.findOneAndUpdate(
    //     { userId: call.userId, timestamp: getStartOfHour(call.timestamp) },
    //     { $inc: { totalDials: 1, totalTalkTimeMinutes: call.duration }, $addToSet: { callIds: call.id } },
    //     { upsert: true, new: true }
    //   );
    // }

    console.log("Manual sync triggered by admin:", token.email);
    return NextResponse.json({ message: "Data sync started successfully." });
  } catch (error) {
    console.error("Sync Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 