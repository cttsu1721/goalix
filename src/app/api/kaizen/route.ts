import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  calculateKaizenPoints,
  isBalancedDay,
  type KaizenCheckinInput,
} from "@/types/kaizen";

// GET /api/kaizen - Get Kaizen check-in(s)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    // Single date query
    if (dateParam) {
      const date = new Date(dateParam);
      date.setHours(0, 0, 0, 0);

      const checkin = await prisma.kaizenCheckin.findUnique({
        where: {
          userId_checkinDate: {
            userId: session.user.id,
            checkinDate: date,
          },
        },
      });

      return NextResponse.json({ checkin });
    }

    // Date range query
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - limit * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    const checkins = await prisma.kaizenCheckin.findMany({
      where: {
        userId: session.user.id,
        checkinDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { checkinDate: "desc" },
      take: limit,
    });

    // Get streak data
    const kaizenStreak = await prisma.streak.findFirst({
      where: {
        userId: session.user.id,
        type: "KAIZEN_CHECKIN",
      },
    });

    return NextResponse.json({
      checkins,
      streak: {
        currentCount: kaizenStreak?.currentCount || 0,
        longestCount: kaizenStreak?.longestCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching kaizen checkins:", error);
    return NextResponse.json(
      { error: "Failed to fetch kaizen checkins" },
      { status: 500 }
    );
  }
}

// POST /api/kaizen - Create or update Kaizen check-in for today
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      health,
      relationships,
      wealth,
      career,
      personalGrowth,
      lifestyle,
      notes,
      date: dateParam,
    } = body as KaizenCheckinInput & { date?: string };

    // Use provided date or today
    const checkinDate = dateParam ? new Date(dateParam) : new Date();
    checkinDate.setHours(0, 0, 0, 0);

    // Calculate points
    const checkinInput: KaizenCheckinInput = {
      health: !!health,
      relationships: !!relationships,
      wealth: !!wealth,
      career: !!career,
      personalGrowth: !!personalGrowth,
      lifestyle: !!lifestyle,
      notes,
    };
    const pointsEarned = calculateKaizenPoints(checkinInput);

    // Check if checkin already exists for this date
    const existingCheckin = await prisma.kaizenCheckin.findUnique({
      where: {
        userId_checkinDate: {
          userId: session.user.id,
          checkinDate,
        },
      },
    });

    let checkin;
    let pointsDelta = pointsEarned;

    if (existingCheckin) {
      // Update existing - subtract old points, add new
      pointsDelta = pointsEarned - existingCheckin.pointsEarned;

      checkin = await prisma.kaizenCheckin.update({
        where: { id: existingCheckin.id },
        data: {
          health: !!health,
          relationships: !!relationships,
          wealth: !!wealth,
          career: !!career,
          personalGrowth: !!personalGrowth,
          lifestyle: !!lifestyle,
          notes: notes || null,
          pointsEarned,
        },
      });
    } else {
      // Create new checkin
      checkin = await prisma.kaizenCheckin.create({
        data: {
          userId: session.user.id,
          checkinDate,
          health: !!health,
          relationships: !!relationships,
          wealth: !!wealth,
          career: !!career,
          personalGrowth: !!personalGrowth,
          lifestyle: !!lifestyle,
          notes: notes || null,
          pointsEarned,
        },
      });
    }

    // Update user points if there's a change
    if (pointsDelta !== 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          totalPoints: {
            increment: pointsDelta,
          },
        },
      });
    }

    // Update streak (only for new checkins or first update of the day)
    if (!existingCheckin) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const kaizenStreak = await prisma.streak.upsert({
        where: {
          userId_type: {
            userId: session.user.id,
            type: "KAIZEN_CHECKIN",
          },
        },
        create: {
          userId: session.user.id,
          type: "KAIZEN_CHECKIN",
          currentCount: 1,
          longestCount: 1,
          lastActionAt: today,
        },
        update: {
          currentCount: {
            increment: 1,
          },
          lastActionAt: today,
        },
      });

      // Update longest if needed
      if (kaizenStreak.currentCount > kaizenStreak.longestCount) {
        await prisma.streak.update({
          where: { id: kaizenStreak.id },
          data: { longestCount: kaizenStreak.currentCount },
        });
      }
    }

    // Get updated streak
    const streak = await prisma.streak.findFirst({
      where: {
        userId: session.user.id,
        type: "KAIZEN_CHECKIN",
      },
    });

    return NextResponse.json({
      checkin,
      pointsEarned,
      pointsDelta,
      isBalancedDay: isBalancedDay(checkinInput),
      streak: {
        currentCount: streak?.currentCount || 0,
        longestCount: streak?.longestCount || 0,
      },
    });
  } catch (error) {
    console.error("Error creating kaizen checkin:", error);
    return NextResponse.json(
      { error: "Failed to create kaizen checkin" },
      { status: 500 }
    );
  }
}
