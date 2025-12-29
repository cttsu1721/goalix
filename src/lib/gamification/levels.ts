import { prisma } from "@/lib/db";
import { LEVELS } from "@/types/gamification";

export interface LevelInfo {
  level: number;
  name: string;
  totalPoints: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  progress: number; // 0-100
  isMaxLevel: boolean;
}

/**
 * Calculate level info from total points
 */
export function calculateLevelInfo(totalPoints: number): LevelInfo {
  // Find current level
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (totalPoints >= level.pointsRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }

  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  const isMaxLevel = !nextLevel;

  // Calculate progress within current level
  const currentLevelPoints = totalPoints - currentLevel.pointsRequired;
  const pointsToNextLevel = nextLevel
    ? nextLevel.pointsRequired - totalPoints
    : 0;
  const levelRange = nextLevel
    ? nextLevel.pointsRequired - currentLevel.pointsRequired
    : 1;
  const progress = isMaxLevel
    ? 100
    : Math.min(100, Math.round((currentLevelPoints / levelRange) * 100));

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    totalPoints,
    currentLevelPoints,
    pointsToNextLevel,
    progress,
    isMaxLevel,
  };
}

/**
 * Check if adding points would cause a level up
 */
export function wouldLevelUp(
  currentPoints: number,
  pointsToAdd: number
): { levelUp: boolean; newLevel: LevelInfo; previousLevel: number } {
  const beforeLevel = calculateLevelInfo(currentPoints);
  const afterLevel = calculateLevelInfo(currentPoints + pointsToAdd);

  return {
    levelUp: afterLevel.level > beforeLevel.level,
    newLevel: afterLevel,
    previousLevel: beforeLevel.level,
  };
}

/**
 * Add points to user and handle level up
 */
export async function addPointsToUser(
  userId: string,
  points: number
): Promise<{
  success: boolean;
  leveledUp: boolean;
  newLevel?: LevelInfo;
  previousLevel?: number;
  totalPoints: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true, level: true },
  });

  if (!user) {
    return { success: false, leveledUp: false, totalPoints: 0 };
  }

  const { levelUp, newLevel, previousLevel } = wouldLevelUp(
    user.totalPoints,
    points
  );

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      totalPoints: { increment: points },
      level: newLevel.level,
    },
  });

  return {
    success: true,
    leveledUp: levelUp,
    newLevel: levelUp ? newLevel : undefined,
    previousLevel: levelUp ? previousLevel : undefined,
    totalPoints: updatedUser.totalPoints,
  };
}

/**
 * Get level name from level number
 */
export function getLevelName(level: number): string {
  const levelInfo = LEVELS.find((l) => l.level === level);
  return levelInfo?.name || "Unknown";
}

/**
 * Get all level milestones with completion status
 */
export function getLevelMilestones(currentPoints: number) {
  return LEVELS.map((level) => ({
    ...level,
    completed: currentPoints >= level.pointsRequired,
    current:
      level.level === calculateLevelInfo(currentPoints).level,
  }));
}
