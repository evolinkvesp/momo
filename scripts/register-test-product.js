require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function registerTestProduct() {
  const email = 'fornecedor@teste.com';

  console.log(`Finding supplier ${email}...`);

  // 1. Get supplier ID
  const { data: supplierData, error: supplierError } = await supabase
    .from('fornecedores')
    .select('id')
    .eq('razao_social', 'Farmácia de Teste LTDA')
    .single();

  if (supplierError || !supplierData) {
    console.error('Supplier not found. Did you run the create script?');
    return;
  }

  const supplierId = supplierData.id;
  console.log('Supplier ID found:', supplierId);

  // 2. Register test product
  console.log('Registering test product...');
  const { data: productData, error: productError } = await supabase
    .from('fornecedor_produtos')
    .insert({
      fornecedor_id: supplierId,
      tipo_produto: 'caixa',
      dose_mg: 5.0,
      unidades_por_caixa: 4,
      preco: 950.00,
      preco_promocional: 890.00,
      estoque_disponivel: 100,
      ativo: true
    })
    .select()
    .single();

  if (productError) {
    console.error('Product Error:', productError.message);
  } else {
    console.log('Test product registered successfully:', productData.id);
    console.log('Product details:', {
      type: productData.tipo_produto,
      dose: productData.dose_mg,
      price: productData.preco
    });
  }
}

registerTestProduct();
