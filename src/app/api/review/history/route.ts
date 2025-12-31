import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/review/history - Get past review submissions
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "weekly"; // "weekly" or "monthly"
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (type === "weekly") {
      const reviews = await prisma.weeklyReview.findMany({
        where: { userId: session.user.id },
        orderBy: { weekStart: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.weeklyReview.count({
        where: { userId: session.user.id },
      });

      return NextResponse.json({
        reviews,
        total,
        hasMore: offset + reviews.length < total,
      });
    } else if (type === "monthly") {
      const reviews = await prisma.monthlyReview.findMany({
        where: { userId: session.user.id },
        orderBy: { monthStart: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.monthlyReview.count({
        where: { userId: session.user.id },
      });

      return NextResponse.json({
        reviews,
        total,
        hasMore: offset + reviews.length < total,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'weekly' or 'monthly'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching review history:", error);
    return NextResponse.json(
      { error: "Failed to fetch review history" },
      { status: 500 }
    );
  }
}
