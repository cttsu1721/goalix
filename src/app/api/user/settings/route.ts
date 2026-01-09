import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/user/settings - Get user settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        timezone: true,
        notifyDailyReminder: true,
        notifyWeeklyReview: true,
        notifyAchievements: true,
        enableSoundEffects: true,
        maxMitCount: true,
        showMotivationalQuotes: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, timezone, notifyDailyReminder, notifyWeeklyReview, notifyAchievements, enableSoundEffects, maxMitCount, showMotivationalQuotes } = body;

    // Build update data
    const updateData: {
      name?: string;
      timezone?: string;
      notifyDailyReminder?: boolean;
      notifyWeeklyReview?: boolean;
      notifyAchievements?: boolean;
      enableSoundEffects?: boolean;
      maxMitCount?: number;
      showMotivationalQuotes?: boolean;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length > 100) {
        return NextResponse.json(
          { error: "Invalid name" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (timezone !== undefined) {
      // Basic timezone validation
      if (typeof timezone !== "string" || timezone.length > 50) {
        return NextResponse.json(
          { error: "Invalid timezone" },
          { status: 400 }
        );
      }
      updateData.timezone = timezone;
    }

    // Handle notification preferences
    if (notifyDailyReminder !== undefined) {
      updateData.notifyDailyReminder = Boolean(notifyDailyReminder);
    }
    if (notifyWeeklyReview !== undefined) {
      updateData.notifyWeeklyReview = Boolean(notifyWeeklyReview);
    }
    if (notifyAchievements !== undefined) {
      updateData.notifyAchievements = Boolean(notifyAchievements);
    }

    // Handle UX preferences
    if (enableSoundEffects !== undefined) {
      updateData.enableSoundEffects = Boolean(enableSoundEffects);
    }
    if (maxMitCount !== undefined) {
      const mitCount = Number(maxMitCount);
      if (isNaN(mitCount) || mitCount < 1 || mitCount > 3) {
        return NextResponse.json(
          { error: "MIT limit must be between 1 and 3" },
          { status: 400 }
        );
      }
      updateData.maxMitCount = mitCount;
    }
    if (showMotivationalQuotes !== undefined) {
      updateData.showMotivationalQuotes = Boolean(showMotivationalQuotes);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        timezone: true,
        notifyDailyReminder: true,
        notifyWeeklyReview: true,
        notifyAchievements: true,
        enableSoundEffects: true,
        maxMitCount: true,
        showMotivationalQuotes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
