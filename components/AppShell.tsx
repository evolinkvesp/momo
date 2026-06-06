"use client";

import { BottomNav } from "./BottomNav";
import { Fab } from "./Fab";
import { FabVisibilityProvider, useFabVisibility } from "./FabVisibilityContext";
import { TrialBanner } from "./TrialBanner";

/**
 * Application shell. Mobile-first: a centered content column with an expanding
 * FAB and a floating bottom navigation pill.
 */
function AppShellContent({ children }: { children: React.ReactNode }) {
  const { fabHidden } = useFabVisibility();

  return (
    <div className="app-container min-h-screen bg-bg">
      {/* Trial / acesso expirado: aparece acima de todo o conteúdo. */}
      <TrialBanner />
      <main className="mx-auto w-full max-w-md px-6 pb-32 pt-6">
        <div>{children}</div>
      </main>
      {!fabHidden && <Fab />}
      <BottomNav />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FabVisibilityProvider>
      <AppShellContent>{children}</AppShellContent>
    </FabVisibilityProvider>
  );
}
