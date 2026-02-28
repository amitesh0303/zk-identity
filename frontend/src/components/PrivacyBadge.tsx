import clsx from "clsx";

type Color = "blue" | "green" | "purple" | "orange" | "slate";

interface PrivacyBadgeProps {
  label: string;
  color?: Color;
}

const colorMap: Record<Color, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function PrivacyBadge({ label, color = "blue" }: PrivacyBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
        colorMap[color]
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
