import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Monthly Review",
};

export default function MonthlyReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monthly Review</h1>
        <p className="text-muted-foreground">
          Review your monthly progress and set new targets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Monthly Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Review your monthly goals, celebrate wins, and plan for next month.
          </p>
          <Button>Start Monthly Review</Button>
        </CardContent>
      </Card>
    </div>
  );
}
