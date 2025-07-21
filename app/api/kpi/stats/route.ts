import { NextResponse } from 'next/server';
import { NextApiRequest } from 'next';
import connectDB from '../../../../lib/mongodb';
import HourlyCallStats from '../../../../models/HourlyCallStats';
import { getToken } from 'next-auth/jwt';

// Helper function to calculate date ranges
const getDateRange = (period: string, date: string | null) => {
  const now = date ? new Date(date) : new Date();
  let start: Date, end: Date;

  switch (period) {
    case 'hourly':
      start = new Date(now.setHours(now.getHours(), 0, 0, 0));
      end = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
      break;
    case 'daily':
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(new Date().setDate(now.getDate() + 1));
      break;
    case 'weekly':
      start = new Date(now.setDate(now.getDate() - now.getDay()));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    // Add cases for monthly, quarterly, yearly
    default:
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(new Date().setDate(now.getDate() + 1));
  }
  return { start, end };
};

export async function GET(request: NextApiRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(request.url || '');
  const period = searchParams.get('period') || 'daily';
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');

  const { start, end } = getDateRange(period, date);

  const matchStage = {
    timestamp: { $gte: start, $lt: end },
    ...(userId && { userId }),
  };

  try {
    const stats = await HourlyCallStats.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalDials: { $sum: '$totalDials' },
          totalTalkTimeMinutes: { $sum: '$totalTalkTimeMinutes' },
        },
      },
    ]);

    // Create a default structure for kpis
    const kpis = {
      totalDials: stats[0]?.totalDials || 0,
      totalTalkTimeMinutes: stats[0]?.totalTalkTimeMinutes || 0,
      inboundCalls: 0, // You may need another field to track this
    };

    // Placeholder for chart data logic
    const chartData: any[] = []; 

    return NextResponse.json({ kpis, chartData });
  } catch (error) {
    console.error("Aggregation Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 