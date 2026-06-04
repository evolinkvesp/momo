import { createServerClient } from "@/lib/supabase-server";
import { SaudeClient } from "./SaudeClient";

export default async function SaudePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  // Profile to get height, start date, and target weight
  const { data: profile } = await supabase
    .from('profiles')
    .select('altura_cm, data_inicio_tratamento, peso_meta, peso_inicial')
    .eq('id', session.user.id)
    .single();

  // Fetch medicoes
  const { data: medicoes } = await supabase
    .from('medicoes_saude')
    .select('*')
    .eq('user_id', session.user.id)
    .order('data_medicao', { ascending: false });

  // Fetch sintomas
  const { data: sintomas } = await supabase
    .from('sintomas')
    .select('*')
    .eq('user_id', session.user.id)
    .order('data', { ascending: false });

  return (
    <SaudeClient 
      userId={session.user.id}
      profile={profile}
      initialMedicoes={medicoes || []}
      initialSintomas={sintomas || []}
    />
  );
}