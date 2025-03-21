
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Settings, LayoutDashboard } from "lucide-react";

export function Header() {
  const location = useLocation();
  const isDashboardPage = location.pathname === "/";
  const isSettingsPage = location.pathname === "/settings";

  return (
    <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50 w-full transition-all duration-200">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            to="/" 
            className="text-xl font-semibold tracking-tight transition-colors hover:text-primary/90"
          >
            Netdata Dashboard
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={isDashboardPage ? "default" : "ghost"} 
            size="sm" 
            className="hidden sm:flex items-center gap-1"
            asChild
          >
            <Link to="/">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          
          <Button 
            variant={isSettingsPage ? "default" : "ghost"} 
            size="sm" 
            className="hidden sm:flex items-center gap-1"
            asChild
          >
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Link>
          </Button>
          
          <ThemeToggle />
          
          {/* Mobile Nav */}
          <div className="sm:hidden flex items-center gap-1">
            <Button 
              variant={isDashboardPage ? "default" : "ghost"} 
              size="icon" 
              className="h-9 w-9" 
              asChild
            >
              <Link to="/">
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </Button>
            
            <Button 
              variant={isSettingsPage ? "default" : "ghost"} 
              size="icon" 
              className="h-9 w-9" 
              asChild
            >
              <Link to="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
