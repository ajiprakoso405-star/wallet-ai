import { useTheme } from "@/components/ThemeProvider";

export function useChartColors() {
  const { theme } = useTheme();

  if (theme === "light") {
    return {
      grid: "#e5e7eb",
      tickFill: "#6b7280",
      tooltipBg: "#ffffff",
      tooltipBorder: "#d0d7de",
      tooltipColor: "#1f2328",
    };
  }

  return {
    grid: "#21262d",
    tickFill: "#8b949e",
    tooltipBg: "#1c2128",
    tooltipBorder: "#30363d",
    tooltipColor: "#e6edf3",
  };
}
