import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="text-center p-8 rounded-xl"
      style={{ background: "#1a1a1a", border: "1px dashed #2d2d2d" }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4"
        style={{ background: "#222", color: "#555" }}
      >
        {icon}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm mb-6" style={{ color: "#9ca3af" }}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
