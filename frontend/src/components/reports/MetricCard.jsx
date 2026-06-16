import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricCard({ title, value, subtext, icon: Icon, tone = "default", onClick }) {
  const toneClass = {
    default: "bg-muted/40 text-muted-foreground",
    success: "bg-green-500/10 text-green-700 dark:text-green-300",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    danger: "bg-red-500/10 text-red-700 dark:text-red-300",
    info: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  }[tone];

  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) onClick();
      }}
      className={onClick ? "cursor-pointer text-left transition-colors hover:bg-accent/40" : ""}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={`rounded-md p-2 ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>}
      </CardContent>
    </Card>
  );
}
