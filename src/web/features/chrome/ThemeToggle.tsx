import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "../../app/theme-context";
import { themeLabel } from "../../app/theme";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const label = `Theme: ${themeLabel(theme)}. Click to cycle.`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          onClick={cycleTheme}
        >
          {theme === "light" ? (
            <Sun className="size-4" />
          ) : theme === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Monitor className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{themeLabel(theme)}</TooltipContent>
    </Tooltip>
  );
}
