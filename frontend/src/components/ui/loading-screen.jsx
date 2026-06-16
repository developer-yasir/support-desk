import { cn } from "@/lib/utils";

export default function LoadingScreen({
  title = "Loading your workspace",
  subtitle = "Pulling in the latest data and preparing the view...",
  className = "",
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl",
        className
      )}
    >
      <div className="absolute inset-0 opacity-70">
        <div
          className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-cyan-500/25 blur-3xl"
          style={{ animation: "pulse 4s ease-in-out infinite" }}
        />
        <div
          className="absolute right-0 top-0 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl"
          style={{ animation: "pulse 5s ease-in-out infinite", animationDelay: "0.8s" }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"
          style={{ animation: "pulse 6s ease-in-out infinite", animationDelay: "1.4s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-12 text-center">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div
            className="absolute inset-1 rounded-full border border-cyan-400/35 border-t-cyan-300"
            style={{ animation: "spin 1.15s linear infinite" }}
          />
          <div
            className="absolute inset-4 rounded-full border border-fuchsia-400/35 border-r-fuchsia-300"
            style={{ animation: "spin 1.8s linear infinite reverse" }}
          />
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-400 via-sky-300 to-fuchsia-500 shadow-[0_0_30px_rgba(34,211,238,0.35)] animate-pulse" />
        </div>

        <div className="space-y-2">
          <p className="text-lg font-semibold tracking-tight">{title}</p>
          <p className="mx-auto max-w-md text-sm text-white/70">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
            Syncing records
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
            Updating layout
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
            Almost there
          </span>
        </div>

        <div className="flex items-end gap-2 pt-2" aria-hidden>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-8 w-2 rounded-full bg-gradient-to-t from-cyan-400 to-fuchsia-400"
              style={{
                animation: "bounce 1s ease-in-out infinite",
                animationDelay: `${index * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
