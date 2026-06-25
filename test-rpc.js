const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wlnlmmvlhjazqifyetse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbmxtbXZsaGphenFpZnlldHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQwNzI2NCwiZXhwIjoyMDk1OTgzMjY0fQ.b_KsvghWvGW-qkr8XX5bn472rCdWAhNUN8evH60539Y';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('get_active_suppliers_with_prices', {
    p_cidade: null,
    p_estado: null
  });
  console.log("RPC Error:", error);
  console.log("RPC Data:", data);

  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log("Profiles Error:", pErr);
  console.log("Profiles:", profiles);
}
test();
