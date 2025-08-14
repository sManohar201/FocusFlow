import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { TimerDisplay } from "@/components/dashboard/timer-display";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <WelcomeHeader />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Timer */}
            <div className="lg:col-span-1">
              <TimerDisplay />
            </div>

            {/* Right Column: Stats and Activity */}
            <div className="lg:col-span-2 space-y-6">
              <StatsGrid />
              <ActivityHeatmap />
            </div>
          </div>

          {/* Full Width: Kanban Board */}
          <KanbanBoard />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
