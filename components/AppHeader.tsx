import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NotificationBell } from "./NotificationBell";

export function AppHeader({
  userId,
  name,
  subtitle,
  initials,
  avatarUrl,
}: {
  userId?: string;
  name: string;
  subtitle?: string;
  initials?: string;
  avatarUrl?: string;
}) {
  const date =
    subtitle ?? format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const fallback =
    initials ?? (name.trim().slice(0, 2).toUpperCase() || "MT");

  return (
    <header className="flex items-center justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-[22px] font-bold tracking-tight text-white">
          Olá, {name}!
        </h1>
        <p className="mt-0.5 text-[13px] font-medium capitalize" style={{ color: "#9ca3af" }}>
          {date}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell userId={userId} />
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #ff6500, #cc4c00)" }}
          >
            {fallback}
          </div>
        )}
      </div>
    </header>
  );
}
