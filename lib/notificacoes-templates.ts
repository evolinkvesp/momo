export const NOTIFICACOES = {

  // 1. LEMBRETE DE DOSE
  DOSE_HOJE: (nome: string) => ({
    title: `💉 Hora da sua dose, ${nome.split(' ')[0]}!`,
    body: 'Hoje é o dia da sua aplicação semanal de Mounjaro. Não esqueça!',
    url: '/doses',
    tag: 'dose-lembrete',
  }),

  // 2. DOSE ATRASADA
  DOSE_ATRASADA: (nome: string, dias: number) => ({
    title: `⚠️ Sua dose está ${dias} dia${dias > 1 ? 's' : ''} atrasada`,
    body: `${nome.split(' ')[0]}, a regularidade é essencial para o resultado. Registre sua dose agora.`,
    url: '/doses',
    tag: 'dose-atrasada',
  }),

  // 3. ESTOQUE CRÍTICO
  ESTOQUE_BAIXO: (nome: string, qtd: number) => ({
    title: '📦 Estoque quase acabando!',
    body: `Você tem apenas ${qtd} ampola${qtd > 1 ? 's' : ''} restante${qtd > 1 ? 's' : ''}. Compre agora antes de faltar.`,
    url: '/estoque',
    tag: 'estoque-baixo',
  }),

  // 4. CONQUISTA DESBLOQUEADA
  CONQUISTA: (nome: string, conquista: string, emoji: string) => ({
    title: `${emoji} Conquista desbloqueada!`,
    body: `Parabéns ${nome.split(' ')[0]}! Você acabou de conquistar "${conquista}". Continue assim!`,
    url: '/',
    tag: 'conquista',
  }),

  // 5. META DE PESO ATINGIDA
  META_PESO: (nome: string, perdido: number) => ({
    title: `🎉 Incrível, ${nome.split(' ')[0]}!`,
    body: `Você perdeu ${perdido}kg desde o início do tratamento. Seu esforço está valendo!`,
    url: '/saude',
    tag: 'meta-peso',
  }),

  // 6. SEM REGISTRAR PESO
  PESO_SEM_REGISTRO: (nome: string, dias: number) => ({
    title: '⚖️ Hora de se pesar!',
    body: `Faz ${dias} dias sem registrar seu peso. Acompanhar a evolução é parte do tratamento.`,
    url: '/saude',
    tag: 'peso-lembrete',
  }),

  // 7. TRIAL EXPIRANDO
  TRIAL_EXPIRANDO: (nome: string, dias: number) => ({
    title: `🌿 Seu trial expira em ${dias} dia${dias > 1 ? 's' : ''}`,
    body: 'Assine o Momo Premium para continuar acompanhando seu tratamento por R$ 29,90/mês.',
    url: '/plano',
    tag: 'trial-expirando',
  }),

  // 8. PEDIDO ACEITO
  PEDIDO_ACEITO: (nome: string, codigo: string, previsao: string) => ({
    title: '✅ Pedido confirmado!',
    body: `Seu pedido ${codigo} foi aceito. Previsão de entrega: ${previsao}.`,
    url: '/meus-pedidos',
    tag: 'pedido-aceito',
  }),

  // 9. PEDIDO A CAMINHO
  PEDIDO_ENVIADO: (nome: string, codigo: string) => ({
    title: '🏍️ Seu Mounjaro está a caminho!',
    body: `O motoboy já saiu com seu pedido ${codigo}. Fique de olho!`,
    url: '/meus-pedidos',
    tag: 'pedido-enviado',
  }),

  // 10. DICA SEMANAL PERSONALIZADA
  DICA_SEMANAL: (nome: string, fase: number) => ({
    title: `💡 Dica da semana para você`,
    body: fase === 1
      ? 'Coma de 3 em 3 horas e prefira alimentos frios. Isso reduz a náusea na Fase 1.'
      : fase === 2
      ? 'Priorize proteína em toda refeição. Frango, ovo e peixe são seus aliados na Fase 2.'
      : 'Hidrate-se bem! 2L de água por dia potencializa os resultados na Fase 3.',
    url: '/dieta',
    tag: 'dica-semanal',
  }),
};

export type NotificationTemplateKey = keyof typeof NOTIFICACOES;
