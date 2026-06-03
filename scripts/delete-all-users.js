require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltam variáveis de ambiente do Supabase.');
  process.exit(1);
}

// Inicializa com a chave de serviço para bypassar o RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllUsers() {
  console.log('Buscando contas de usuários...');
  
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Erro ao buscar usuários:', error.message);
    return;
  }

  const users = data.users;
  console.log(`Foram encontradas ${users.length} contas.`);

  if (users.length === 0) {
    console.log('Nenhuma conta para excluir.');
    return;
  }

  for (const user of users) {
    console.log(`\nLimpando dependências do usuário ${user.email} (${user.id})...`);
    
    // 1. Apagar configurações de notificação e push
    await supabase.from('configuracoes_notificacao').delete().eq('user_id', user.id);
    await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
    await supabase.from('receitas_geradas').delete().eq('user_id', user.id);
    
    // 2. Apagar dados do rastreamento (paciente)
    await supabase.from('refeicoes').delete().eq('user_id', user.id);
    await supabase.from('doses').delete().eq('user_id', user.id);
    await supabase.from('pesos').delete().eq('user_id', user.id);
    
    // 3. Se for um paciente com pedidos, apagar o histórico e avaliações primeiro
    const { data: pedidosPaciente } = await supabase.from('pedidos').select('id').eq('paciente_id', user.id);
    if (pedidosPaciente && pedidosPaciente.length > 0) {
      for (const p of pedidosPaciente) {
        await supabase.from('historico_status_pedido').delete().eq('pedido_id', p.id);
        await supabase.from('avaliacoes_produto').delete().eq('pedido_id', p.id);
        await supabase.from('pedidos').delete().eq('id', p.id);
      }
    }

    // 4. Se for fornecedor, apagar dados de fornecedor
    const { data: fornecedores } = await supabase.from('fornecedores').select('id').eq('user_id', user.id);
    if (fornecedores && fornecedores.length > 0) {
      for (const f of fornecedores) {
        // Apagar todos os pedidos onde ele é fornecedor (e dependentes)
        const { data: pedidosFornec } = await supabase.from('pedidos').select('id').eq('fornecedor_id', f.id);
        if (pedidosFornec && pedidosFornec.length > 0) {
          for (const p of pedidosFornec) {
            await supabase.from('historico_status_pedido').delete().eq('pedido_id', p.id);
            await supabase.from('avaliacoes_produto').delete().eq('pedido_id', p.id);
            await supabase.from('pedidos').delete().eq('id', p.id);
          }
        }
        
        await supabase.from('avaliacoes_produto').delete().eq('fornecedor_id', f.id);
        await supabase.from('fornecedor_produtos').delete().eq('fornecedor_id', f.id);
        await supabase.from('fornecedores').delete().eq('id', f.id);
      }
    }

    // 5. Por fim, apagar o profile público
    await supabase.from('profiles').delete().eq('id', user.id);

    // 6. Excluir o usuário da autenticação
    console.log(`Excluindo usuário ${user.email} do Auth...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error(`❌ Erro ao excluir ${user.email}:`, deleteError.message);
    } else {
      console.log(`✅ Usuário ${user.email} excluído com sucesso.`);
    }
  }

  console.log('\n✨ Limpeza total concluída!');
}

deleteAllUsers();
