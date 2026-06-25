// Rota descontinuada — assinatura de usuários removida, acesso ao Momo é gratuito para pacientes.
export async function POST() {
  return Response.json({ error: 'Not found' }, { status: 404 });
}
