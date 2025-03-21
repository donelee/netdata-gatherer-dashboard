
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full transition-all duration-300"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 transition-all duration-300" />
      ) : (
        <Sun className="h-5 w-5 transition-all duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
