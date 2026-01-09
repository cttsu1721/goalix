"use client";

import { Skeleton } from "@/components/ui/skeleton";

// MIT Card Skeleton
export function MitCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-night via-night to-night-soft border border-lantern/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl bg-night-mist" />
          <div>
            <Skeleton className="h-3 w-32 bg-night-mist mb-2" />
            <Skeleton className="h-4 w-20 bg-night-mist" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg bg-night-mist" />
      </div>
      {/* Task content */}
      <div className="py-4">
        <Skeleton className="h-5 w-3/4 bg-night-mist mb-2" />
        <Skeleton className="h-4 w-1/2 bg-night-mist" />
      </div>
    </div>
  );
}

// Task List Skeleton - shows 3 placeholder tasks
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-4 border-b border-night-mist last:border-0"
        >
          <Skeleton className="w-[22px] h-[22px] rounded-lg bg-night-mist flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 bg-night-mist mb-2" />
            <Skeleton className="h-3 w-1/4 bg-night-mist" />
          </div>
          <Skeleton className="w-10 h-5 rounded-full bg-night-mist" />
        </div>
      ))}
    </div>
  );
}

// Section Skeleton (with header and task list)
export function TaskSectionSkeleton({
  title,
  count = 3,
}: {
  title?: string;
  count?: number;
}) {
  return (
    <div className="mb-8">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-24 bg-night-mist" />
          <Skeleton className="h-8 w-20 rounded-lg bg-night-mist" />
        </div>
      )}
      <TaskListSkeleton count={count} />
    </div>
  );
}

// Stats Panel Skeleton
export function StatsPanelSkeleton() {
  return (
    <div className="space-y-6">
      {/* Level Card */}
      <div className="bg-night border border-night-mist rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-full bg-night-mist" />
          <div>
            <Skeleton className="h-4 w-20 bg-night-mist mb-1" />
            <Skeleton className="h-3 w-28 bg-night-mist" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full bg-night-mist" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-night border border-night-mist rounded-xl p-4">
            <Skeleton className="w-8 h-8 rounded-lg bg-night-mist mb-3" />
            <Skeleton className="h-6 w-12 bg-night-mist mb-1" />
            <Skeleton className="h-3 w-16 bg-night-mist" />
          </div>
        ))}
      </div>

      {/* Streak Card */}
      <div className="bg-night border border-night-mist rounded-2xl p-5">
        <Skeleton className="h-4 w-24 bg-night-mist mb-4" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-night-mist" />
          <div>
            <Skeleton className="h-6 w-12 bg-night-mist mb-1" />
            <Skeleton className="h-3 w-20 bg-night-mist" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Complete Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="mb-2">
        <Skeleton className="h-6 w-48 bg-night-mist mb-2" />
        <Skeleton className="h-8 w-64 bg-night-mist" />
      </div>

      {/* 1-Year Target Skeleton */}
      <div className="bg-gradient-to-r from-lantern/5 to-transparent border border-lantern/10 rounded-2xl p-5 mb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-3 w-24 bg-night-mist mb-2" />
            <Skeleton className="h-5 w-3/4 bg-night-mist" />
          </div>
          <Skeleton className="w-20 h-6 rounded-full bg-night-mist" />
        </div>
      </div>

      {/* MIT Section */}
      <MitCardSkeleton />

      {/* Primary Tasks */}
      <TaskSectionSkeleton title="Primary" count={3} />

      {/* Secondary Tasks */}
      <TaskSectionSkeleton title="Secondary" count={2} />
    </div>
  );
}

// Goal Card Skeleton
export function GoalCardSkeleton() {
  return (
    <div className="bg-night border border-night-mist rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl bg-night-mist flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 bg-night-mist mb-2" />
          <Skeleton className="h-3 w-full bg-night-mist" />
        </div>
      </div>
      <Skeleton className="h-2 w-full rounded-full bg-night-mist" />
    </div>
  );
}

// Goals Page Skeleton
export function GoalsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32 bg-night-mist" />
        <Skeleton className="h-10 w-28 rounded-xl bg-night-mist" />
      </div>

      {/* Goal Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <GoalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
