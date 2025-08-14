import { Zap, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last) || user.email[0].toUpperCase();
  };

  const getUserName = () => {
    if (!user) return "User";
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email;
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">FocusFlow</span>
          </div>

          {/* User Info & Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <span className="text-sm font-medium">{getUserName()}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
