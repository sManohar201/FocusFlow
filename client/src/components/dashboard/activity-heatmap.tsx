import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function ActivityHeatmap() {
  const [selectedYear] = useState(new Date().getFullYear());
  
  const { data: heatmapData } = useQuery({
    queryKey: ['heatmapData', selectedYear],
    queryFn: () => apiRequest('GET', `/api/analytics/heatmap?year=${selectedYear}`),
  });

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const days = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  // Generate a grid of days for the year
  const generateYearGrid = () => {
    const grid = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear + 1, 0, 1);
    
    // Calculate weeks in year
    const weeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        if (currentDate >= endDate) break;
        
        const dateString = currentDate.toISOString().split('T')[0];
        const sessionCount = (heatmapData as Record<string, number>)?.[dateString] || 0;
        
        grid.push({
          date: dateString,
          sessionCount,
          intensity: getIntensity(sessionCount),
        });
      }
    }
    
    return grid;
  };

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-slate-100 dark:bg-slate-800',
      'bg-green-200 dark:bg-green-800',
      'bg-green-300 dark:bg-green-700',
      'bg-green-400 dark:bg-green-600',
      'bg-green-500 dark:bg-green-500',
    ];
    return colors[intensity] || colors[0];
  };

  const yearGrid = generateYearGrid();
  const totalSessions = Object.values(heatmapData || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Activity</h3>
        <div className="text-sm text-muted-foreground">
          {totalSessions} sessions in the last year
        </div>
      </div>
      
      <div className="space-y-2">
        {/* Month labels */}
        <div className="flex text-xs text-muted-foreground pl-8">
          <div className="w-3 h-3 mr-1"></div>
          {months.map((month, index) => (
            <div key={index} className="flex-1 text-center">
              {month}
            </div>
          ))}
        </div>
        
        {/* Day grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col text-xs text-muted-foreground space-y-1 mr-2">
            {days.map((day, index) => (
              <div key={index} className="h-3 flex items-center">
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap days */}
          <div className="flex-1 grid grid-cols-52 gap-1">
            {yearGrid.map((day, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} hover:scale-110 transition-transform cursor-pointer`}
                title={`${day.sessionCount} sessions on ${day.date}`}
              />
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Less</span>
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
