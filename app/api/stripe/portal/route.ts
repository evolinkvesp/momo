// Rota descontinuada — portal de pacientes removido. Portal de fornecedores em /api/fornecedor/stripe/portal.
export async function POST() {
  return Response.json({ error: 'Not found' }, { status: 404 });
}
