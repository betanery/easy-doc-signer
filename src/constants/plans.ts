import type { PlanName } from "@/types/mdsign-app-router";

export const PLANS = {
  CEDRO: {
    id: 1,
    name: "CEDRO" as PlanName,
    displayName: "Cedro",
    price: 0,
    docsLimit: 5,
    usersLimit: 1,
    description: "Gratuito - 5 documentos totais",
    features: ["5 envios gratuitos", "Assinatura digital válida", "Suporte por e-mail"],
  },
  JACARANDA: {
    id: 2,
    name: "JACARANDA" as PlanName,
    displayName: "Jacarandá",
    price: 3990,
    docsLimit: 20,
    usersLimit: 1,
    description: "R$ 39,90/mês - 20 documentos/mês",
    features: ["20 documentos mensais", "Assinatura digital válida", "Suporte prioritário", "Histórico de documentos"],
  },
  ANGICO: {
    id: 3,
    name: "ANGICO" as PlanName,
    displayName: "Angico",
    price: 9997,
    docsLimit: null, // unlimited
    usersLimit: 4,
    description: "R$ 99,97/mês - Documentos ilimitados",
    features: ["Documentos ilimitados", "4 usuários inclusos", "API disponível", "Suporte dedicado", "Relatórios avançados"],
  },
  AROEIRA: {
    id: 4,
    name: "AROEIRA" as PlanName,
    displayName: "Aroeira",
    price: 14997,
    docsLimit: null,
    usersLimit: 6,
    description: "R$ 149,97/mês - Documentos ilimitados",
    features: ["Documentos ilimitados", "6 usuários inclusos", "API disponível", "Webhooks", "Suporte VIP"],
  },
  IPE: {
    id: 5,
    name: "IPE" as PlanName,
    displayName: "Ipê",
    price: 19997,
    docsLimit: null,
    usersLimit: 10,
    description: "R$ 199,97/mês - Documentos ilimitados",
    features: ["Documentos ilimitados", "10 usuários inclusos", "API completa", "Webhooks", "Geração em massa", "Suporte premium"],
  },
  MOGNO: {
    id: 6,
    name: "MOGNO" as PlanName,
    displayName: "Mogno",
    price: null, // custom pricing
    docsLimit: null,
    usersLimit: null,
    description: "Sob consulta - Enterprise",
    features: ["Documentos ilimitados", "Usuários ilimitados", "API enterprise", "White-label", "SLA garantido", "Gerente de conta dedicado"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
