import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { TimerDisplay } from "@/components/dashboard/timer-display";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const handleLogout = () => {
    setLocation("/login");
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FF</span>
              </div>
              <span className="text-xl font-semibold">FocusFlow</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
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
