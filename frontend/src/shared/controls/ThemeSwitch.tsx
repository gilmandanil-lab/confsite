import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useTheme } from "../../app/providers/ThemeProvider";

export function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 text-slate-600 transition-all duration-300 hover:bg-slate-200 hover:shadow-md dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}
